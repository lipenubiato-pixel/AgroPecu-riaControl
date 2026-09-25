import React, { useState } from 'react';
import { Sparkles, Bot, AlertTriangle, Lightbulb, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { CropField, LivestockGroup, Machine, ActivityLog } from '../types';

interface AgroInsightViewProps {
  crops: CropField[];
  livestock: LivestockGroup[];
  machines: Machine[];
  activities: ActivityLog[];
  onLogRecommendation?: (title: string, notes: string) => void;
}

interface OperationalInsight {
  pillar: 'lavoura' | 'rebanho' | 'maquina';
  severity: 'alerta' | 'manutencao' | 'manejo';
  title: string;
  description: string;
  practicalAction: string;
}

export const AgroInsightView: React.FC<AgroInsightViewProps> = ({
  crops,
  livestock,
  machines,
  onLogRecommendation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false);
  const [loggedItems, setLoggedItems] = useState<Record<number, boolean>>({});

  const handleGenerateDiagnostics = async () => {
    if (isLoading) return; // Prevenção de clique duplicado

    setIsLoading(true);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout no cliente

    try {
      // 1. Enviar payload sanitizado para o endpoint server-side
      const response = await fetch('/api/agroinsight/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crops: crops.map((c) => ({
            name: c.name,
            crop: c.crop,
            areaHectares: c.areaHectares,
            currentStage: c.currentStage,
          })),
          livestock: livestock.map((l) => ({
            name: l.name,
            category: l.category,
            headCount: l.headCount,
            currentDiet: l.currentDiet,
            hasVaccine: Boolean(l.lastVaccineName || l.lastVaccinationDate),
            lastVaccineName: l.lastVaccineName,
          })),
          machines: machines.map((m) => ({
            model: m.model,
            type: m.type,
            hourMeter: m.hourMeter,
            status: m.status,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Tratamento de códigos de erro HTTP
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite temporário de requisições excedido. Aguarde alguns segundos.');
        } else if (response.status >= 500) {
          throw new Error('Serviço de análise temporariamente instável. Tente novamente em instantes.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Falha ao processar análise da propriedade.');
        }
      }

      const data = await response.json();

      // Validação da resposta
      if (!data || !Array.isArray(data.recommendations)) {
        throw new Error('Resposta do servidor em formato inesperado.');
      }

      setSummary(data.summary || 'Diagnóstico operacional concluído com sucesso.');
      setInsights(data.recommendations);
      setIsFallbackNotice(Boolean(data.isFallback));
      setHasGenerated(true);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMessage('Tempo limite esgotado. A conexão demorou mais que o esperado. Tente novamente.');
      } else {
        setErrorMessage(err.message || 'Erro de comunicação ao gerar diagnóstico.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">
              AgroInsight — Diagnóstico Inteligente
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Análise segura integrada ao Gemini no servidor para gerar alertas práticos de manejo e manutenção.
          </p>
        </div>

        <button
          onClick={handleGenerateDiagnostics}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analisando Propriedade...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" aria-hidden="true" />
              <span>{hasGenerated ? 'Atualizar Diagnóstico' : 'Gerar Diagnóstico da Fazenda'}</span>
            </>
          )}
        </button>
      </div>

      {/* Tratamento e Exibição de Mensagens de Erro */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-bold text-red-900">Atenção ao gerar análise</h3>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handleGenerateDiagnostics}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Estado Vazio Antes da Geração */}
      {!hasGenerated && !isLoading && (
        <div className="bg-white rounded-xl p-10 text-center border border-dashed border-stone-300">
          <Bot className="w-14 h-14 text-emerald-600/50 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-bold text-stone-800">
            Pronto para diagnosticar a propriedade
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            O AgroInsight cruzará as fases dos seus {crops.length} talhões, a sanidade dos seus {livestock.length} lotes de rebanho e o desgaste das suas {machines.length} máquinas para gerar recomendações personalizadas.
          </p>
          <button
            onClick={handleGenerateDiagnostics}
            className="mt-5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
          >
            Executar Diagnóstico Agora
          </button>
        </div>
      )}

      {/* Estado Carregando */}
      {isLoading && (
        <div className="bg-white rounded-xl p-10 text-center border border-stone-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-sm font-bold text-stone-800">
            Processando dados agronômicos no servidor...
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Consultando inteligência analítica com diretrizes de segurança e sem expor credenciais.
          </p>
        </div>
      )}

      {/* Resultados dos Insights */}
      {hasGenerated && !isLoading && (
        <div className="space-y-4">
          {/* Resumo Executivo */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Resumo Executivo da Safra
              </h2>
              <p className="text-sm font-medium text-stone-800 mt-1">{summary}</p>
              {isFallbackNotice && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-stone-500">
                  (Processado com base nas regras analíticas locais de contingência)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{insights.length} Recomendações Estratégicas Geradas</span>
            </h2>
            <span className="text-xs text-stone-400">Consultivo &bull; Decisão final do produtor</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {insights.map((item, index) => {
              const styleMap: Record<string, { border: string; iconBg: string; icon: any; badge: string }> = {
                alerta: {
                  border: 'border-amber-300 bg-amber-50/40',
                  iconBg: 'bg-amber-100 text-amber-800',
                  icon: AlertTriangle,
                  badge: 'Atenção Operacional',
                },
                manutencao: {
                  border: 'border-blue-300 bg-blue-50/40',
                  iconBg: 'bg-blue-100 text-blue-800',
                  icon: Lightbulb,
                  badge: 'Manutenção Preventiva',
                },
                manejo: {
                  border: 'border-emerald-300 bg-emerald-50/40',
                  iconBg: 'bg-emerald-100 text-emerald-800',
                  icon: Sparkles,
                  badge: 'Boas Práticas de Manejo',
                },
              };

              const style = styleMap[item.severity] || styleMap.manejo;
              const Icon = style.icon;
              const isLogged = loggedItems[index];

              return (
                <div
                  key={index}
                  className={`rounded-xl p-5 border ${style.border} shadow-xs flex flex-col sm:flex-row items-start gap-4`}
                >
                  <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700">
                        {style.badge}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        &bull; Pilar: {item.pillar}
                      </span>
                      <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                    </div>

                    <p className="text-xs text-stone-600">{item.description}</p>

                    <div className="mt-2 bg-white/90 p-3 rounded-lg border border-stone-200">
                      <span className="text-xs font-bold text-stone-800 block">
                        Recomendação Técnica:
                      </span>
                      <p className="text-xs text-stone-700 mt-0.5">{item.practicalAction}</p>
                    </div>

                    {/* Confirmação Humana Explícita antes de qualquer persistência no Diário */}
                    {onLogRecommendation && (
                      <div className="pt-2 flex items-center justify-between border-t border-stone-200/60">
                        <span className="text-[11px] text-stone-400 italic">
                          Ação sob confirmação humana
                        </span>
                        <button
                          onClick={() => {
                            if (isLogged) return;
                            onLogRecommendation(item.title, item.practicalAction);
                            setLoggedItems((prev) => ({ ...prev, [index]: true }));
                          }}
                          disabled={isLogged}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                            isLogged
                              ? 'bg-stone-200 text-stone-500 cursor-default'
                              : 'bg-stone-800 hover:bg-stone-900 text-white'
                          }`}
                        >
                          {isLogged ? 'Registrado no Diário' : 'Acatar e Registrar no Diário'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-500 text-center">
            Aviso de Responsabilidade: Recomendações geradas por IA para suporte operacional. A decisão agronômica e aplicação prática em campo são de responsabilidade do produtor responsável.
          </div>
        </div>
      )}
    </div>
  );
};
