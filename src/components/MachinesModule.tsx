import React, { useState } from 'react';
import { Tractor, Plus, Fuel, Wrench, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Machine, MachineType, MachineStatus } from '../types';

interface MachinesModuleProps {
  machines: Machine[];
  onAddMachine: (machine: Omit<Machine, 'id' | 'farmId' | 'lastMaintenanceDate'>) => void;
  onUpdateMachine: (
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
  ) => void;
  onRecordLog: (
    machineId: string,
    actionType: 'abastecimento' | 'manutencao',
    newHourMeter: number,
    litersOrService: string,
    notes: string,
    newStatus?: MachineStatus
  ) => void;
  onDeleteMachine: (machineId: string) => void;
}

export const MachinesModule: React.FC<MachinesModuleProps> = ({
  machines,
  onAddMachine,
  onUpdateMachine,
  onRecordLog,
  onDeleteMachine,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [activeMachine, setActiveMachine] = useState<Machine | null>(null);
  const [logType, setLogType] = useState<'abastecimento' | 'manutencao'>('abastecimento');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Nova Máquina / Editar Máquina
  const [model, setModel] = useState('');
  const [type, setType] = useState<MachineType>('trator');
  const [initialHours, setInitialHours] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState('');
  const [fuelType, setFuelType] = useState<'Diesel S10' | 'Diesel Comum' | 'Gasolina' | 'Etanol' | 'Elétrico'>('Diesel S10');
  const [nextServiceHours, setNextServiceHours] = useState('');
  const [licenseOrSerial, setLicenseOrSerial] = useState('');
  const [status, setStatus] = useState<MachineStatus>('operacional');
  const [addError, setAddError] = useState<string | null>(null);

  // Form Log Abastecimento / Manutenção
  const [newHourMeter, setNewHourMeter] = useState('');
  const [litersOrDetails, setLitersOrDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<MachineStatus>('operacional');
  const [logError, setLogError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingMachine(null);
    setModel('');
    setType('trator');
    setInitialHours('');
    setManufacturingYear('');
    setFuelType('Diesel S10');
    setNextServiceHours('');
    setLicenseOrSerial('');
    setStatus('operacional');
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (target: Machine) => {
    setEditingMachine(target);
    setModel(target.model);
    setType(target.type);
    setInitialHours(target.hourMeter.toString());
    setManufacturingYear(target.manufacturingYear ? target.manufacturingYear.toString() : '');
    setFuelType(target.fuelType || 'Diesel S10');
    setNextServiceHours(target.nextServiceHours ? target.nextServiceHours.toString() : '');
    setLicenseOrSerial(target.licenseOrSerial || '');
    setStatus(target.status);
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const closeMachineModal = () => {
    setIsAddModalOpen(false);
    setEditingMachine(null);
    setAddError(null);
    setIsSubmitting(false);
  };

  const handleMachineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!model.trim()) {
      setAddError('Informe o modelo do equipamento (ex: Trator Valtra A950).');
      return;
    }
    const hours = parseFloat(initialHours);
    if (isNaN(hours) || hours < 0) {
      setAddError('O horímetro deve ser igual ou superior a zero.');
      return;
    }

    const yearNum = manufacturingYear ? parseInt(manufacturingYear, 10) : undefined;
    const nextServiceNum = nextServiceHours ? parseFloat(nextServiceHours) : undefined;

    setIsSubmitting(true);

    if (editingMachine) {
      // UPDATE: altera máquina selecionada, preservando lastMaintenanceDate
      onUpdateMachine(editingMachine.id, {
        model: model.trim(),
        type,
        hourMeter: hours,
        status,
        manufacturingYear: yearNum,
        fuelType,
        nextServiceHours: nextServiceNum,
        licenseOrSerial: licenseOrSerial.trim() || undefined,
      });
    } else {
      // CREATE: nova máquina
      onAddMachine({
        model: model.trim(),
        type,
        hourMeter: hours,
        status: 'operacional',
        manufacturingYear: yearNum,
        fuelType,
        nextServiceHours: nextServiceNum,
        licenseOrSerial: licenseOrSerial.trim() || undefined,
      });
    }

    closeMachineModal();
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMachine) return;

    const hours = parseFloat(newHourMeter);
    // RN03: O horímetro informado não pode ser inferior ao horímetro atual registrado
    if (isNaN(hours) || hours < activeMachine.hourMeter) {
      setLogError(
        `Regra de Segurança: O novo horímetro (${hours || 0}h) não pode ser inferior ao horímetro atual da máquina (${activeMachine.hourMeter}h).`
      );
      return;
    }

    if (!litersOrDetails.trim()) {
      setLogError(
        logType === 'abastecimento'
          ? 'Informe a quantidade de combustível abastecida (ex: 150 litros).'
          : 'Descreva o serviço de manutenção realizado.'
      );
      return;
    }

    onRecordLog(
      activeMachine.id,
      logType,
      hours,
      litersOrDetails.trim(),
      notes.trim(),
      targetStatus
    );

    setLogError(null);
    setNewHourMeter('');
    setLitersOrDetails('');
    setNotes('');
    setActiveMachine(null);
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-slate-100 text-slate-800 rounded-lg">
              <Tractor className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">
              Controle de Frota & Maquinário
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Monitore o horímetro das máquinas, registre abastecimentos e acompanhe manutenções preventivas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-slate-500 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Cadastrar Máquina</span>
        </button>
      </div>

      {/* READ: Lista de Máquinas ou Estado Vazio */}
      {machines.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-stone-300">
          <Tractor className="w-12 h-12 text-stone-300 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-stone-800">Nenhuma máquina cadastrada</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Cadastre os tratores, pulverizadores e caminhonetes da propriedade para controle de abastecimento e manutenção.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Cadastrar Primeira Máquina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">{machine.model}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 uppercase">
                        Tipo: {machine.type}
                      </span>
                      {machine.manufacturingYear && (
                        <span className="inline-block text-xs font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
                          Ano: {machine.manufacturingYear}
                        </span>
                      )}
                      {machine.fuelType && (
                        <span className="inline-block text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {machine.fuelType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-stone-900">{machine.hourMeter}</span>
                    <span className="text-xs font-medium text-stone-500 ml-1">horas</span>
                  </div>
                </div>

                {/* Informações Técnicas e Revisão */}
                {(machine.licenseOrSerial || machine.nextServiceHours) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                    {machine.licenseOrSerial && (
                      <div>
                        <span className="text-stone-400 block font-medium">Chassi / Placa:</span>
                        <span className="text-stone-700 font-semibold truncate block">{machine.licenseOrSerial}</span>
                      </div>
                    )}
                    {machine.nextServiceHours && (
                      <div>
                        <span className="text-stone-400 block font-medium">Próxima Revisão:</span>
                        <span className="text-slate-800 font-semibold block">{machine.nextServiceHours}h</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Operacional Badge */}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      machine.status === 'operacional'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        machine.status === 'operacional' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>
                      {machine.status === 'operacional' ? 'Operacional em Campo' : 'Em Manutenção / Parada'}
                    </span>
                  </span>

                  <span className="text-xs text-stone-500">
                    Última revisão: {new Date(machine.lastMaintenanceDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Ações Rápidas UPDATE: Abastecer e Manutenção */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLogError(null);
                      setLogType('abastecimento');
                      setNewHourMeter(machine.hourMeter.toString());
                      setTargetStatus(machine.status);
                      setActiveMachine(machine);
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors cursor-pointer"
                  >
                    <Fuel className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    <span>Abastecer</span>
                  </button>

                  <button
                    onClick={() => {
                      setLogError(null);
                      setLogType('manutencao');
                      setNewHourMeter(machine.hourMeter.toString());
                      setTargetStatus(machine.status);
                      setActiveMachine(machine);
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span>Manutenção</span>
                  </button>
                </div>
              </div>

              {/* Rodapé com Edição e Exclusão com Confirmação */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400">ID: {machine.id}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(machine)}
                    className="text-stone-500 hover:text-slate-800 p-1 transition-colors cursor-pointer"
                    title="Editar informações da máquina"
                  >
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* DELETE com confirmação */}
                  {deleteConfirmId === machine.id ? (
                    <div className="flex items-center space-x-1.5 bg-red-50 p-1 rounded border border-red-200">
                      <span className="text-red-700 font-semibold text-[11px]">Excluir?</span>
                      <button
                        onClick={() => {
                          onDeleteMachine(machine.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-[11px] cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(machine.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Excluir máquina"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CREATE / UPDATE de Máquina */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">
                {editingMachine ? 'Editar Equipamento' : 'Cadastrar Máquina'}
              </h2>
              <button
                onClick={closeMachineModal}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                title="Fechar"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMachineSubmit} className="mt-4 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label htmlFor="mach-modelo" className="block text-xs font-semibold text-stone-700 mb-1">
                  Modelo / Identificação *
                </label>
                <input
                  id="mach-modelo"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: Trator Valtra A950 ou Case 2388"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mach-tipo" className="block text-xs font-semibold text-stone-700 mb-1">
                    Tipo do Equipamento *
                  </label>
                  <select
                    id="mach-tipo"
                    value={type}
                    onChange={(e) => setType(e.target.value as MachineType)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="trator">Trator Agrícola</option>
                    <option value="colheitadeira">Colheitadeira</option>
                    <option value="pulverizador">Pulverizador</option>
                    <option value="veiculo">Veículo Utilitário</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mach-combustivel" className="block text-xs font-semibold text-stone-700 mb-1">
                    Combustível
                  </label>
                  <select
                    id="mach-combustivel"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="Diesel S10">Diesel S10</option>
                    <option value="Diesel Comum">Diesel Comum</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mach-horas" className="block text-xs font-semibold text-stone-700 mb-1">
                    Horímetro Atual (h) *
                  </label>
                  <input
                    id="mach-horas"
                    type="number"
                    step="0.1"
                    min="0"
                    value={initialHours}
                    onChange={(e) => setInitialHours(e.target.value)}
                    placeholder="Ex: 1250"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label htmlFor="mach-ano" className="block text-xs font-semibold text-stone-700 mb-1">
                    Ano de Fabricação
                  </label>
                  <input
                    id="mach-ano"
                    type="number"
                    min="1970"
                    max="2035"
                    value={manufacturingYear}
                    onChange={(e) => setManufacturingYear(e.target.value)}
                    placeholder="Ex: 2022"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mach-proxima-revisao" className="block text-xs font-semibold text-stone-700 mb-1">
                    Próxima Revisão (Horímetro)
                  </label>
                  <input
                    id="mach-proxima-revisao"
                    type="number"
                    step="0.1"
                    min="0"
                    value={nextServiceHours}
                    onChange={(e) => setNextServiceHours(e.target.value)}
                    placeholder="Ex: 1500"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label htmlFor="mach-chassi" className="block text-xs font-semibold text-stone-700 mb-1">
                    Placa / Nº de Chassi
                  </label>
                  <input
                    id="mach-chassi"
                    type="text"
                    value={licenseOrSerial}
                    onChange={(e) => setLicenseOrSerial(e.target.value)}
                    placeholder="Ex: ABC-1234 ou Série"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              {editingMachine && (
                <div>
                  <label htmlFor="mach-status" className="block text-xs font-semibold text-stone-700 mb-1">
                    Status Atual *
                  </label>
                  <select
                    id="mach-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MachineStatus)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="operacional">Operacional (Em campo)</option>
                    <option value="em_manutencao">Em Manutenção / Parada</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={closeMachineModal}
                  className="px-4 py-2 text-stone-700 text-xs font-semibold hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingMachine ? 'Atualizar Equipamento' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal UPDATE: Registrar Abastecimento / Manutenção */}
      {activeMachine && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  {logType === 'abastecimento' ? 'Registrar Abastecimento' : 'Registrar Manutenção'}
                </h2>
                <p className="text-xs text-stone-500">
                  {activeMachine.model} (Horímetro atual: {activeMachine.hourMeter}h)
                </p>
              </div>
              <button
                onClick={() => setActiveMachine(null)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                title="Fechar"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="mt-4 space-y-4">
              {logError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{logError}</span>
                </div>
              )}

              <div>
                <label htmlFor="log-horas" className="block text-xs font-semibold text-stone-700 mb-1">
                  Horímetro Marcado no Painel (h) *
                </label>
                <input
                  id="log-horas"
                  type="number"
                  step="0.1"
                  min={activeMachine.hourMeter}
                  value={newHourMeter}
                  onChange={(e) => setNewHourMeter(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 font-mono"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Regra RN03: Deve ser maior ou igual a {activeMachine.hourMeter}h.
                </span>
              </div>

              <div>
                <label htmlFor="log-detalhe" className="block text-xs font-semibold text-stone-700 mb-1">
                  {logType === 'abastecimento'
                    ? 'Quantidade Abastecida (Litros) *'
                    : 'Serviço Realizado *'}
                </label>
                <input
                  id="log-detalhe"
                  type="text"
                  value={litersOrDetails}
                  onChange={(e) => setLitersOrDetails(e.target.value)}
                  placeholder={
                    logType === 'abastecimento'
                      ? 'Ex: 150 Litros Diesel S10'
                      : 'Ex: Troca de óleo do motor e filtros'
                  }
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {logType === 'manutencao' && (
                <div>
                  <label htmlFor="log-status" className="block text-xs font-semibold text-stone-700 mb-1">
                    Situação da Máquina após o Serviço *
                  </label>
                  <select
                    id="log-status"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as MachineStatus)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  >
                    <option value="operacional">Operacional (Liberada para o campo)</option>
                    <option value="em_manutencao">Em Manutenção (Aguardando peças)</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="log-obs" className="block text-xs font-semibold text-stone-700 mb-1">
                  Observações Adicionais
                </label>
                <textarea
                  id="log-obs"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Nota fiscal 4920, óleo 15W40 mineral."
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveMachine(null)}
                  className="px-4 py-2 text-stone-700 text-xs font-semibold hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
