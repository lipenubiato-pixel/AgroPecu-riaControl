import React, { useState } from 'react';
import { StorageService } from './services/storage';
import {
  CropField,
  LivestockGroup,
  Machine,
  ActivityLog,
  FarmUser,
  CropStage,
  MachineStatus,
  MachineType,
  LivestockCategory,
} from './types';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CropsModule } from './components/CropsModule';
import { LivestockModule } from './components/LivestockModule';
import { MachinesModule } from './components/MachinesModule';
import { AgroInsightView } from './components/AgroInsightView';

export default function App() {
  // Usuário / Propriedade (READ via StorageService)
  const [user, setUser] = useState<FarmUser>(() => StorageService.getUser());

  // Navegação
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // READ: Estados iniciais carregados da persistência
  const [crops, setCrops] = useState<CropField[]>(() => StorageService.getCrops());
  const [livestock, setLivestock] = useState<LivestockGroup[]>(() => StorageService.getLivestock());
  const [machines, setMachines] = useState<Machine[]>(() => StorageService.getMachines());
  const [activities, setActivities] = useState<ActivityLog[]>(() => StorageService.getActivities());

  // Feedback visual de sucesso ou erro (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Log de auditoria/histórico com ID único e carimbo de data
  const logActivity = (
    module: 'lavoura' | 'rebanho' | 'maquina',
    targetName: string,
    actionTitle: string,
    notes: string = ''
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      farmId: user.id,
      module,
      targetName,
      actionTitle,
      date: new Date().toISOString(),
      notes,
    };
    const updated = [newLog, ...activities];
    setActivities(updated);
    StorageService.saveActivities(updated);
  };

  // ==========================================
  // 1. CRUD: LAVOURA / TALHÕES
  // ==========================================

  // CREATE: Cadastra novo talhão com ID adequado e salva
  const handleAddCrop = (data: Omit<CropField, 'id' | 'farmId' | 'updatedAt'>) => {
    try {
      const newCrop: CropField = {
        ...data,
        id: `crop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        farmId: user.id,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newCrop, ...crops];
      setCrops(updated);
      StorageService.saveCrops(updated);
      logActivity(
        'lavoura',
        newCrop.name,
        `Cadastro de Talhão (${newCrop.areaHectares} ha - ${newCrop.crop})`,
        `Talhão cadastrado na fase de ${newCrop.currentStage}.`
      );
      showToast(`Talhão "${newCrop.name}" criado com sucesso!`);
    } catch {
      showToast('Erro ao salvar talhão. Tente novamente.', 'error');
    }
  };

  // UPDATE: Altera somente o talhão selecionado por ID, preservando farmId e id
  const handleUpdateCrop = (
    cropId: string,
    data: {
      name: string;
      crop: string;
      areaHectares: number;
      currentStage: CropStage;
      variety?: string;
      plantingDate?: string;
      expectedHarvestDate?: string;
      soilType?: string;
    }
  ) => {
    const target = crops.find((c) => c.id === cropId);
    if (!target) {
      showToast('Erro: Talhão não encontrado para atualização.', 'error');
      return;
    }

    const updated = crops.map((c) =>
      c.id === cropId
        ? {
            ...c,
            name: data.name,
            crop: data.crop,
            areaHectares: data.areaHectares,
            currentStage: data.currentStage,
            variety: data.variety,
            plantingDate: data.plantingDate,
            expectedHarvestDate: data.expectedHarvestDate,
            soilType: data.soilType,
            updatedAt: new Date().toISOString(),
          }
        : c
    );
    setCrops(updated);
    StorageService.saveCrops(updated);
    logActivity(
      'lavoura',
      data.name,
      'Edição de Talhão',
      `Dados atualizados: ${data.areaHectares} ha de ${data.crop}${data.variety ? ` (${data.variety})` : ''}.`
    );
    showToast(`Talhão "${data.name}" atualizado com sucesso!`);
  };

  // UPDATE: Altera fase rápida
  const handleUpdateCropStage = (cropId: string, newStage: CropStage) => {
    const stageNames: Record<CropStage, string> = {
      preparo: 'Preparo do Solo',
      plantio: 'Plantio / Semeadura',
      pulverizacao: 'Pulverização e Tratos',
      colheita: 'Colheita',
    };

    const target = crops.find((c) => c.id === cropId);
    if (!target) return;

    const updated = crops.map((c) =>
      c.id === cropId ? { ...c, currentStage: newStage, updatedAt: new Date().toISOString() } : c
    );
    setCrops(updated);
    StorageService.saveCrops(updated);
    logActivity(
      'lavoura',
      target.name,
      `Avanço de Ciclo: ${stageNames[newStage]}`,
      `Fase alterada para ${stageNames[newStage]}.`
    );
    showToast(`Fase do talhão "${target.name}" avançada para ${stageNames[newStage]}.`);
  };

  // DELETE: Remove exclusivamente o registro com o ID correspondente
  const handleDeleteCrop = (cropId: string) => {
    const target = crops.find((c) => c.id === cropId);
    if (!target) {
      showToast('Falha na exclusão: Talhão não localizado.', 'error');
      return;
    }

    const updated = crops.filter((c) => c.id !== cropId);
    setCrops(updated);
    StorageService.saveCrops(updated);
    logActivity('lavoura', target.name, 'Exclusão de Talhão', `Talhão ${target.name} removido da fazenda.`);
    showToast(`Talhão "${target.name}" excluído.`);
  };

  // ==========================================
  // 2. CRUD: REBANHO / PECUÁRIA
  // ==========================================

  // CREATE: Cadastra novo lote de animais
  const handleAddLivestockGroup = (data: Omit<LivestockGroup, 'id' | 'farmId'>) => {
    try {
      const newGroup: LivestockGroup = {
        ...data,
        id: `live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        farmId: user.id,
      };
      const updated = [newGroup, ...livestock];
      setLivestock(updated);
      StorageService.saveLivestock(updated);
      logActivity(
        'rebanho',
        newGroup.name,
        `Cadastro de Lote (${newGroup.headCount} animais)`,
        `Aptidão: ${newGroup.category === 'corte' ? 'Corte' : 'Leite'}. Dieta: ${newGroup.currentDiet}`
      );
      showToast(`Lote "${newGroup.name}" adicionado com sucesso!`);
    } catch {
      showToast('Erro ao cadastrar lote de animais.', 'error');
    }
  };

  // UPDATE: Altera somente o lote selecionado por ID, preservando histórico de vacina
  const handleUpdateLivestockGroup = (
    groupId: string,
    data: {
      name: string;
      category: LivestockCategory;
      headCount: number;
      currentDiet: string;
      breed?: string;
      pastureLocation?: string;
      averageWeightKg?: number;
    }
  ) => {
    const target = livestock.find((l) => l.id === groupId);
    if (!target) {
      showToast('Erro: Lote não encontrado para atualização.', 'error');
      return;
    }

    const updated = livestock.map((l) =>
      l.id === groupId
        ? {
            ...l,
            name: data.name,
            category: data.category,
            headCount: data.headCount,
            currentDiet: data.currentDiet,
            breed: data.breed,
            pastureLocation: data.pastureLocation,
            averageWeightKg: data.averageWeightKg,
          }
        : l
    );
    setLivestock(updated);
    StorageService.saveLivestock(updated);
    logActivity(
      'rebanho',
      data.name,
      'Edição de Lote de Rebanho',
      `Dados atualizados: ${data.headCount} cabeças${data.breed ? ` (${data.breed})` : ''}. Dieta: ${data.currentDiet}.`
    );
    showToast(`Lote "${data.name}" atualizado com sucesso!`);
  };

  // UPDATE: Registra vacinação preservando outros dados do lote
  const handleRecordVaccine = (
    groupId: string,
    vaccineName: string,
    date: string,
    notes?: string
  ) => {
    const target = livestock.find((l) => l.id === groupId);
    if (!target) {
      showToast('Erro: Lote não encontrado.', 'error');
      return;
    }

    const updated = livestock.map((l) =>
      l.id === groupId
        ? {
            ...l,
            lastVaccinationDate: new Date(date).toISOString(),
            lastVaccineName: vaccineName,
          }
        : l
    );
    setLivestock(updated);
    StorageService.saveLivestock(updated);
    logActivity(
      'rebanho',
      target.name,
      `Vacinação: ${vaccineName}`,
      notes || `Aplicação registrada em ${new Date(date).toLocaleDateString('pt-BR')}.`
    );
    showToast(`Vacinação registrada no lote "${target.name}".`);
  };

  // DELETE: Remove exclusivamente o lote com o ID correspondente
  const handleDeleteLivestockGroup = (groupId: string) => {
    const target = livestock.find((l) => l.id === groupId);
    if (!target) {
      showToast('Falha na exclusão: Lote não localizado.', 'error');
      return;
    }

    const updated = livestock.filter((l) => l.id !== groupId);
    setLivestock(updated);
    StorageService.saveLivestock(updated);
    logActivity('rebanho', target.name, 'Exclusão de Lote', `Lote ${target.name} removido.`);
    showToast(`Lote "${target.name}" excluído.`);
  };

  // ==========================================
  // 3. CRUD: MAQUINÁRIO / FROTA
  // ==========================================

  // CREATE: Cadastra nova máquina
  const handleAddMachine = (data: Omit<Machine, 'id' | 'farmId' | 'lastMaintenanceDate'>) => {
    try {
      const newMachine: Machine = {
        ...data,
        id: `mach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        farmId: user.id,
        lastMaintenanceDate: new Date().toISOString(),
      };
      const updated = [newMachine, ...machines];
      setMachines(updated);
      StorageService.saveMachines(updated);
      logActivity(
        'maquina',
        newMachine.model,
        `Cadastro de Máquina (${newMachine.hourMeter}h)`,
        `Tipo: ${newMachine.type}. Horímetro inicial configurado.`
      );
      showToast(`Máquina "${newMachine.model}" cadastrada com sucesso!`);
    } catch {
      showToast('Erro ao cadastrar máquina.', 'error');
    }
  };

  // UPDATE: Altera somente a máquina selecionada por ID, preservando lastMaintenanceDate
  const handleUpdateMachine = (
    machineId: string,
    data: {
      model: string;
      type: MachineType;
      hourMeter: number;
      status: MachineStatus;
      manufacturingYear?: number;
      fuelType?: 'Diesel S10' | 'Diesel Comum' | 'Gasolina' | 'Etanol' | 'Elétrico';
      nextServiceHours?: number;
      licenseOrSerial?: string;
    }
  ) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) {
      showToast('Erro: Máquina não encontrada para atualização.', 'error');
      return;
    }

    const updated = machines.map((m) =>
      m.id === machineId
        ? {
            ...m,
            model: data.model,
            type: data.type,
            hourMeter: data.hourMeter,
            status: data.status,
            manufacturingYear: data.manufacturingYear,
            fuelType: data.fuelType,
            nextServiceHours: data.nextServiceHours,
            licenseOrSerial: data.licenseOrSerial,
          }
        : m
    );
    setMachines(updated);
    StorageService.saveMachines(updated);
    logActivity(
      'maquina',
      data.model,
      'Edição de Equipamento',
      `Informações atualizadas. Horímetro: ${data.hourMeter}h. Status: ${data.status}.`
    );
    showToast(`Equipamento "${data.model}" atualizado com sucesso!`);
  };

  // UPDATE: Abastecimento ou Manutenção mecânica
  const handleRecordMachineLog = (
    machineId: string,
    actionType: 'abastecimento' | 'manutencao',
    newHourMeter: number,
    litersOrService: string,
    notes: string,
    newStatus?: MachineStatus
  ) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) {
      showToast('Erro: Máquina não encontrada.', 'error');
      return;
    }

    const updated = machines.map((m) =>
      m.id === machineId
        ? {
            ...m,
            hourMeter: newHourMeter,
            status: newStatus !== undefined ? newStatus : m.status,
            lastMaintenanceDate:
              actionType === 'manutencao' ? new Date().toISOString() : m.lastMaintenanceDate,
          }
        : m
    );
    setMachines(updated);
    StorageService.saveMachines(updated);

    const title =
      actionType === 'abastecimento'
        ? `Abastecimento: ${litersOrService}`
        : `Manutenção Mecânica: ${litersOrService}`;

    logActivity(
      'maquina',
      target.model,
      title,
      `Horímetro atualizado de ${target.hourMeter}h para ${newHourMeter}h. ${notes}`
    );
    showToast(`Operação registrada para "${target.model}".`);
  };

  // DELETE: Remove exclusivamente a máquina com o ID correspondente
  const handleDeleteMachine = (machineId: string) => {
    const target = machines.find((m) => m.id === machineId);
    if (!target) {
      showToast('Falha na exclusão: Máquina não localizada.', 'error');
      return;
    }

    const updated = machines.filter((m) => m.id !== machineId);
    setMachines(updated);
    StorageService.saveMachines(updated);
    logActivity('maquina', target.model, 'Exclusão de Equipamento', `Máquina ${target.model} removida.`);
    showToast(`Máquina "${target.model}" excluída.`);
  };

  // Reset para a Demonstração
  const handleResetData = () => {
    StorageService.resetToDefault();
    setUser(StorageService.getUser());
    setCrops(StorageService.getCrops());
    setLivestock(StorageService.getLivestock());
    setMachines(StorageService.getMachines());
    setActivities(StorageService.getActivities());
    showToast('Dados restaurados para o padrão de demonstração!');
  };

  // Alterar Proprietário e Nome da Fazenda
  const handleUpdateUser = (name: string, farmName: string) => {
    const updatedUser: FarmUser = {
      ...user,
      name,
      farmName,
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
    showToast(`Proprietário alterado para "${name}"!`);
  };

  // Limpar Histórico do Diário de Campo
  const handleClearActivities = () => {
    setActivities([]);
    StorageService.clearActivities();
    showToast('Relatório do diário de campo e atividades apagado com sucesso.');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased">
      {/* Toast de Feedback (Sucesso e Erro) */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-lg border flex items-center space-x-2 transition-all ${
            toast.type === 'error'
              ? 'bg-red-900 border-red-700 text-red-100'
              : 'bg-stone-900 border-stone-700 text-white'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Barra de Navegação */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onUpdateUser={handleUpdateUser}
        onResetData={handleResetData}
      />

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            crops={crops}
            livestock={livestock}
            machines={machines}
            activities={activities}
            onNavigate={(tab) => setCurrentTab(tab as NavTab)}
            onClearActivities={handleClearActivities}
          />
        )}

        {currentTab === 'crops' && (
          <CropsModule
            crops={crops}
            onAddCrop={handleAddCrop}
            onUpdateCrop={handleUpdateCrop}
            onUpdateStage={handleUpdateCropStage}
            onDeleteCrop={handleDeleteCrop}
          />
        )}

        {currentTab === 'livestock' && (
          <LivestockModule
            livestock={livestock}
            onAddGroup={handleAddLivestockGroup}
            onUpdateGroup={handleUpdateLivestockGroup}
            onRecordVaccine={handleRecordVaccine}
            onDeleteGroup={handleDeleteLivestockGroup}
          />
        )}

        {currentTab === 'machines' && (
          <MachinesModule
            machines={machines}
            onAddMachine={handleAddMachine}
            onUpdateMachine={handleUpdateMachine}
            onRecordLog={handleRecordMachineLog}
            onDeleteMachine={handleDeleteMachine}
          />
        )}

        {currentTab === 'agroinsight' && (
          <AgroInsightView
            crops={crops}
            livestock={livestock}
            machines={machines}
            activities={activities}
            onLogRecommendation={(title, notes) => {
              logActivity('lavoura', 'AgroInsight IA', `Recomendação Acatada: ${title}`, notes);
              showToast('Recomendação da IA registrada no Diário de Campo!');
            }}
          />
        )}
      </main>

      {/* Rodapé da Aplicação */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-500">
          AgroContro — Gestão Inteligente de Propriedade Rural &bull; MVP de Demonstração
        </div>
      </footer>
    </div>
  );
}
