import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Limite de tamanho de requisição para segurança
app.use(express.json({ limit: '20kb' }));

// Helper para inicialização do Gemini com cabeçalho de telemetria exigido
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback determinístico caso o Gemini não esteja configurado, sem rede ou erro de cota
function generateDeterministicFallback(crops: any[], livestock: any[], machines: any[]) {
  const recommendations: any[] = [];

  // Verificação de máquinas
  const machUnderMaintenance = machines.find((m) => m.status === 'em_manutencao');
  const highHoursMach = machines.find((m) => (Number(m.hourMeter) || 0) >= 1000);

  if (machUnderMaintenance) {
    recommendations.push({
      pillar: 'maquina',
      severity: 'alerta',
      title: `Liberar equipamento: ${machUnderMaintenance.model}`,
      description: `Máquina com horímetro em ${machUnderMaintenance.hourMeter}h com status "em manutenção".`,
      practicalAction: 'Agilizar a revisão mecânica para evitar atraso nas janelas de pulverização e colheita.',
    });
  } else if (highHoursMach) {
    recommendations.push({
      pillar: 'maquina',
      severity: 'manutencao',
      title: `Revisão Preventiva: ${highHoursMach.model}`,
      description: `Horímetro acumulado em ${highHoursMach.hourMeter} horas de operação.`,
      practicalAction: 'Realizar troca de filtros de óleo, ar e lubrificação das graxeiras.',
    });
  }

  // Verificação de lavouras
  const pulverizacaoCrop = crops.find((c) => c.currentStage === 'pulverizacao');
  const colheitaCrop = crops.find((c) => c.currentStage === 'colheita');

  if (pulverizacaoCrop) {
    recommendations.push({
      pillar: 'lavoura',
      severity: 'manejo',
      title: `Janela Fitossanitária: ${pulverizacaoCrop.name}`,
      description: `Cultura de ${pulverizacaoCrop.crop} (${pulverizacaoCrop.areaHectares} ha) na fase de pulverização.`,
      practicalAction: 'Monitorar condições de vento e respeitar o período de carência dos produtos agrícolas aplicados.',
    });
  } else if (colheitaCrop) {
    recommendations.push({
      pillar: 'lavoura',
      severity: 'manejo',
      title: `Logística de Colheita: ${colheitaCrop.name}`,
      description: `Área de ${colheitaCrop.areaHectares} ha de ${colheitaCrop.crop} pronta para colheita.`,
      practicalAction: 'Verificar teor de umidade e organizar transporte para recepção de grãos.',
    });
  }

  // Verificação de rebanho
  const groupSemVacina = livestock.find((l) => !l.hasVaccine && !l.lastVaccineName);
  if (groupSemVacina) {
    recommendations.push({
      pillar: 'rebanho',
      severity: 'alerta',
      title: `Sanidade Pendente: ${groupSemVacina.name}`,
      description: `Lote com ${groupSemVacina.headCount || 0} animais sem registro recente de imunização.`,
      practicalAction: 'Agendar vacinação e vermifugação preventiva do lote conforme calendário sanitário.',
    });
  } else {
    recommendations.push({
      pillar: 'rebanho',
      severity: 'manejo',
      title: 'Manejo Nutricional do Rebanho',
      description: 'Lotes monitorados com histórico sanitário em dia.',
      practicalAction: 'Acompanhar escore de condição corporal e disponibilidade de água e sal mineral.',
    });
  }

  return {
    summary: 'Diagnóstico operacional processado com sucesso pelas diretrizes agronômicas da propriedade.',
    recommendations: recommendations.slice(0, 3),
    isFallback: true,
  };
}

// ENDPOINT SERVER-SIDE: POST /api/agroinsight/analyze
app.post('/api/agroinsight/analyze', async (req, res) => {
  try {
    const { crops = [], livestock = [], machines = [] } = req.body;

    // 1. Validação de Entrada
    if (!Array.isArray(crops) || !Array.isArray(livestock) || !Array.isArray(machines)) {
      return res.status(400).json({ error: 'Formato de payload inválido.' });
    }

    if (crops.length === 0 && livestock.length === 0 && machines.length === 0) {
      return res.status(400).json({ error: 'Envie pelo menos um talhão, lote ou máquina para análise.' });
    }

    // Limites de tamanho de entrada para evitar abusos
    if (crops.length > 30 || livestock.length > 30 || machines.length > 30) {
      return res.status(400).json({ error: 'Quantidade de registros excede o limite máximo permitido.' });
    }

    // 2. Obter cliente Gemini com verificação do secret
    const ai = getGeminiClient();

    if (!ai) {
      // Caso a chave não esteja no ambiente de teste, utiliza fallback seguro
      const fallbackResult = generateDeterministicFallback(crops, livestock, machines);
      return res.json(fallbackResult);
    }

    // Sanitização de dados de entrada antes de compor o prompt
    const sanitizedContext = {
      lavouras: crops.slice(0, 10).map((c: any) => ({
        identificacao: String(c.name || '').substring(0, 50),
        cultura: String(c.crop || '').substring(0, 40),
        variedade: c.variety ? String(c.variety).substring(0, 40) : undefined,
        area_ha: Number(c.areaHectares) || 0,
        fase: String(c.currentStage || '').substring(0, 20),
        solo: c.soilType ? String(c.soilType).substring(0, 30) : undefined,
        previsao_colheita: c.expectedHarvestDate ? String(c.expectedHarvestDate).substring(0, 10) : undefined,
      })),
      rebanho: livestock.slice(0, 10).map((l: any) => ({
        lote: String(l.name || '').substring(0, 50),
        aptidao: String(l.category || '').substring(0, 20),
        raca: l.breed ? String(l.breed).substring(0, 30) : undefined,
        cabecas: Number(l.headCount) || 0,
        peso_medio_kg: Number(l.averageWeightKg) || undefined,
        piquete: l.pastureLocation ? String(l.pastureLocation).substring(0, 40) : undefined,
        dieta: String(l.currentDiet || '').substring(0, 60),
        vacina_recente: Boolean(l.lastVaccineName || l.lastVaccinationDate),
      })),
      maquinas: machines.slice(0, 10).map((m: any) => ({
        modelo: String(m.model || '').substring(0, 50),
        tipo: String(m.type || '').substring(0, 30),
        ano: Number(m.manufacturingYear) || undefined,
        combustivel: m.fuelType ? String(m.fuelType).substring(0, 20) : undefined,
        horimetro_h: Number(m.hourMeter) || 0,
        proxima_revisao_h: Number(m.nextServiceHours) || undefined,
        status: String(m.status || '').substring(0, 25),
      })),
    };

    // 3. Chamada Gemini com saída estruturada (responseSchema) e Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos timeout

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analise os dados consolidados desta fazenda e gere as recomendações operacionais:\n${JSON.stringify(sanitizedContext)}`,
        config: {
          systemInstruction:
            'Você é o AgroInsight, assistente de inteligência e diagnóstico rural. Analise os dados da propriedade (lavouras, rebanho e máquinas) e gere exatamente de 2 a 3 recomendações consultivas de manejo, boas práticas e manutenção preventiva. Responda estritamente em Português do Brasil no formato JSON estrito conforme o schema definido. Nunca recomende dosagens ou marcas comerciais de venenos/medicamentos restritos.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'Visão executiva sintetizada da situação da fazenda em até duas frases.',
              },
              recommendations: {
                type: Type.ARRAY,
                description: 'Lista de 2 a 3 recomendações práticas de campo.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pillar: {
                      type: Type.STRING,
                      description: 'Pilar da recomendação (lavoura, rebanho ou maquina).',
                    },
                    severity: {
                      type: Type.STRING,
                      description: 'Classificação (alerta, manutencao ou manejo).',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Título curto e objetivo da recomendação.',
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Contexto observado com base nos dados fornecidos.',
                    },
                    practicalAction: {
                      type: Type.STRING,
                      description: 'Ação prática recomendada para o produtor.',
                    },
                  },
                  required: ['pillar', 'severity', 'title', 'description', 'practicalAction'],
                },
              },
            },
            required: ['summary', 'recommendations'],
          },
        },
      });

      clearTimeout(timeoutId);

      const responseText = response.text ? response.text.trim() : '';
      if (!responseText) {
        throw new Error('Resposta vazia da IA.');
      }

      // 4. Validação Server-side da resposta
      const parsed = JSON.parse(responseText);
      if (!parsed.summary || !Array.isArray(parsed.recommendations)) {
        throw new Error('Formato da resposta fora do padrão esperado.');
      }

      // Higienizar e limitar quantidade
      const validated = {
        summary: String(parsed.summary).substring(0, 300),
        recommendations: parsed.recommendations.slice(0, 3).map((rec: any) => ({
          pillar: ['lavoura', 'rebanho', 'maquina'].includes(rec.pillar) ? rec.pillar : 'manejo',
          severity: ['alerta', 'manutencao', 'manejo'].includes(rec.severity) ? rec.severity : 'manejo',
          title: String(rec.title || 'Recomendação Operacional').substring(0, 80),
          description: String(rec.description || '').substring(0, 250),
          practicalAction: String(rec.practicalAction || '').substring(0, 250),
        })),
        isFallback: false,
      };

      return res.json(validated);
    } catch (genError: any) {
      clearTimeout(timeoutId);
      console.warn('Alerta Gemini API: Utilizando mecanismo de contingência determinístico.', genError?.message || genError);

      // Se falhar por timeout, 429, 5xx ou schema inválido, ativa contingência
      const fallbackResult = generateDeterministicFallback(crops, livestock, machines);
      return res.json(fallbackResult);
    }
  } catch (err: any) {
    console.error('Erro na rota /api/agroinsight/analyze:', err?.message || err);
    return res.status(500).json({
      error: 'Não foi possível processar a análise no momento. Tente novamente mais tarde.',
    });
  }
});

// Integração com Vite em desenvolvimento
async function startServer() {
  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor AgroContro rodando na porta ${PORT}`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

startServer();
