import React, { useState } from 'react';
import { Beef, Plus, Syringe, Trash2, AlertCircle, Edit2 } from 'lucide-react';
import { LivestockGroup, LivestockCategory } from '../types';

interface LivestockModuleProps {
  livestock: LivestockGroup[];
  onAddGroup: (group: Omit<LivestockGroup, 'id' | 'farmId'>) => void;
  onUpdateGroup: (
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
  ) => void;
  onRecordVaccine: (groupId: string, vaccineName: string, date: string, notes?: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const LivestockModule: React.FC<LivestockModuleProps> = ({
  livestock,
  onAddGroup,
  onUpdateGroup,
  onRecordVaccine,
  onDeleteGroup,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LivestockGroup | null>(null);
  const [vaccineModalGroup, setVaccineModalGroup] = useState<LivestockGroup | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Novo / Edição de Lote
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LivestockCategory>('corte');
  const [breed, setBreed] = useState('');
  const [pastureLocation, setPastureLocation] = useState('');
  const [averageWeightKg, setAverageWeightKg] = useState('');
  const [headCount, setHeadCount] = useState('');
  const [diet, setDiet] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Form Vacina
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [vaccineError, setVaccineError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingGroup(null);
    setName('');
    setCategory('corte');
    setBreed('');
    setPastureLocation('');
    setAverageWeightKg('');
    setHeadCount('');
    setDiet('');
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (target: LivestockGroup) => {
    setEditingGroup(target);
    setName(target.name);
    setCategory(target.category);
    setBreed(target.breed || '');
    setPastureLocation(target.pastureLocation || '');
    setAverageWeightKg(target.averageWeightKg ? target.averageWeightKg.toString() : '');
    setHeadCount(target.headCount.toString());
    setDiet(target.currentDiet);
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const closeLoteModal = () => {
    setIsAddModalOpen(false);
    setEditingGroup(null);
    setAddError(null);
    setIsSubmitting(false);
  };

  const handleLoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setAddError('Informe o nome ou identificação do lote.');
      return;
    }

    // Regra RN02: contagem não pode ser negativa
    const count = parseInt(headCount, 10);
    if (isNaN(count) || count < 0) {
      setAddError('A quantidade de cabeças deve ser igual ou superior a zero.');
      return;
    }

    const weightNum = averageWeightKg ? parseFloat(averageWeightKg) : undefined;
    if (weightNum !== undefined && (isNaN(weightNum) || weightNum <= 0)) {
      setAddError('O peso médio estimado deve ser superior a zero.');
      return;
    }

    setIsSubmitting(true);

    if (editingGroup) {
      // UPDATE: altera registro selecionado, preserva histórico sanitário
      onUpdateGroup(editingGroup.id, {
        name: name.trim(),
        category,
        headCount: count,
        currentDiet: diet.trim() || 'Pasto rotacionado com sal mineral',
        breed: breed.trim() || undefined,
        pastureLocation: pastureLocation.trim() || undefined,
        averageWeightKg: weightNum,
      });
    } else {
      // CREATE: novo lote
      onAddGroup({
        name: name.trim(),
        category,
        headCount: count,
        currentDiet: diet.trim() || 'Pasto rotacionado com sal mineral',
        breed: breed.trim() || undefined,
        pastureLocation: pastureLocation.trim() || undefined,
        averageWeightKg: weightNum,
        lastVaccinationDate: null,
      });
    }

    closeLoteModal();
  };

  const handleVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) {
      setVaccineError('Informe o nome da vacina ou medicamento aplicado.');
      return;
    }
    if (!vaccineDate) {
      setVaccineError('Informe a data da aplicação.');
      return;
    }

    if (vaccineModalGroup) {
      onRecordVaccine(vaccineModalGroup.id, vaccineName.trim(), vaccineDate, vaccineNotes.trim());
    }

    setVaccineError(null);
    setVaccineName('');
    setVaccineNotes('');
    setVaccineModalGroup(null);
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Beef className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">
              Controle do Rebanho & Manejo
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Organize os lotes de animais, controle o histórico de vacinação e monitore a dieta do rebanho.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-amber-500 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Novo Lote de Animais</span>
        </button>
      </div>

      {/* READ: Listagem de Lotes ou Estado Vazio */}
      {livestock.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-stone-300">
          <Beef className="w-12 h-12 text-stone-300 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-stone-800">Nenhum lote de animais cadastrado</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Cadastre os lotes para gerenciar a sanidade, nutrição e contagem do rebanho da fazenda.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Cadastrar Primeiro Lote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {livestock.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">{group.name}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          group.category === 'corte'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        Aptidão: {group.category === 'corte' ? 'Pecuária de Corte' : 'Gado Leiteiro'}
                      </span>
                      {group.breed && (
                        <span className="inline-block text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          Raça: {group.breed}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-stone-900">{group.headCount}</span>
                    <span className="text-xs text-stone-500 ml-1">cabeças</span>
                  </div>
                </div>

                {/* Informações Zootécnicas Expandidas */}
                {(group.pastureLocation || group.averageWeightKg) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                    {group.pastureLocation && (
                      <div>
                        <span className="text-stone-400 block font-medium">Localização / Piquete:</span>
                        <span className="text-stone-700 font-semibold truncate block">{group.pastureLocation}</span>
                      </div>
                    )}
                    {group.averageWeightKg && (
                      <div>
                        <span className="text-stone-400 block font-medium">Peso Médio Estimado:</span>
                        <span className="text-amber-800 font-semibold block">{group.averageWeightKg} kg / cab</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 space-y-2 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="font-semibold text-stone-700 block">Dieta Atual:</span>
                    <span className="text-stone-600 mt-0.5 block">{group.currentDiet}</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-700 block">Última Vacinação:</span>
                      <span className="text-stone-600 block mt-0.5">
                        {group.lastVaccinationDate
                          ? `${new Date(group.lastVaccinationDate).toLocaleDateString('pt-BR')} ${
                              group.lastVaccineName ? `(${group.lastVaccineName})` : ''
                            }`
                          : 'Nenhuma vacina registrada'}
                      </span>
                    </div>
                    {/* Ação UPDATE: Vacinar */}
                    <button
                      onClick={() => {
                        setVaccineError(null);
                        setVaccineModalGroup(group);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-md border border-amber-300 cursor-pointer"
                    >
                      <Syringe className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Vacinar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rodapé com Edição e Exclusão com Confirmação */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400">ID: {group.id}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(group)}
                    className="text-stone-500 hover:text-amber-700 p-1 transition-colors cursor-pointer"
                    title="Editar informações do lote"
                  >
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* DELETE com confirmação */}
                  {deleteConfirmId === group.id ? (
                    <div className="flex items-center space-x-1.5 bg-red-50 p-1 rounded border border-red-200">
                      <span className="text-red-700 font-semibold text-[11px]">Excluir?</span>
                      <button
                        onClick={() => {
                          onDeleteGroup(group.id);
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
                      onClick={() => setDeleteConfirmId(group.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Excluir lote"
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

      {/* Modal CREATE / UPDATE de Lote */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">
                {editingGroup ? 'Editar Lote de Rebanho' : 'Novo Lote de Rebanho'}
              </h2>
              <button
                onClick={closeLoteModal}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                title="Fechar"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLoteSubmit} className="mt-4 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label htmlFor="lote-nome" className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Lote / Piquete *
                </label>
                <input
                  id="lote-nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lote Bezerros Desmame"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lote-categoria" className="block text-xs font-semibold text-stone-700 mb-1">
                    Finalidade *
                  </label>
                  <select
                    id="lote-categoria"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LivestockCategory)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="corte">Gado de Corte</option>
                    <option value="leite">Gado de Leite</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lote-raca" className="block text-xs font-semibold text-stone-700 mb-1">
                    Raça Predominante
                  </label>
                  <input
                    id="lote-raca"
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ex: Nelore, Angus, Girolando"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lote-cabecas" className="block text-xs font-semibold text-stone-700 mb-1">
                    Cabeças de Gado *
                  </label>
                  <input
                    id="lote-cabecas"
                    type="number"
                    min="0"
                    value={headCount}
                    onChange={(e) => setHeadCount(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="lote-peso" className="block text-xs font-semibold text-stone-700 mb-1">
                    Peso Médio (kg / cabeça)
                  </label>
                  <input
                    id="lote-peso"
                    type="number"
                    step="0.1"
                    min="1"
                    value={averageWeightKg}
                    onChange={(e) => setAverageWeightKg(e.target.value)}
                    placeholder="Ex: 420"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lote-piquete" className="block text-xs font-semibold text-stone-700 mb-1">
                  Piquete / Localização na Fazenda
                </label>
                <input
                  id="lote-piquete"
                  type="text"
                  value={pastureLocation}
                  onChange={(e) => setPastureLocation(e.target.value)}
                  placeholder="Ex: Piquete 02 - Riacho ou Confinamento A"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="lote-dieta" className="block text-xs font-semibold text-stone-700 mb-1">
                  Alimentação / Dieta Atual
                </label>
                <input
                  id="lote-dieta"
                  type="text"
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  placeholder="Ex: Pasto + Suplementação Mineral"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={closeLoteModal}
                  className="px-4 py-2 text-stone-700 text-xs font-semibold hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingGroup ? 'Atualizar Lote' : 'Salvar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal UPDATE: Registrar Vacina */}
      {vaccineModalGroup && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Registro de Vacinação</h2>
                <p className="text-xs text-stone-500">{vaccineModalGroup.name}</p>
              </div>
              <button
                onClick={() => setVaccineModalGroup(null)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                title="Fechar"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVaccineSubmit} className="mt-4 space-y-4">
              {vaccineError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{vaccineError}</span>
                </div>
              )}

              <div>
                <label htmlFor="vacina-nome" className="block text-xs font-semibold text-stone-700 mb-1">
                  Vacina ou Medicamento *
                </label>
                <input
                  id="vacina-nome"
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="Ex: Febre Aftosa, Raiva, Brucelose"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="vacina-data" className="block text-xs font-semibold text-stone-700 mb-1">
                  Data da Aplicação *
                </label>
                <input
                  id="vacina-data"
                  type="date"
                  value={vaccineDate}
                  onChange={(e) => setVaccineDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="vacina-obs" className="block text-xs font-semibold text-stone-700 mb-1">
                  Observações / Dosagem
                </label>
                <textarea
                  id="vacina-obs"
                  rows={2}
                  value={vaccineNotes}
                  onChange={(e) => setVaccineNotes(e.target.value)}
                  placeholder="Ex: Aplicação de 2ml via subcutânea em todo o lote."
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setVaccineModalGroup(null)}
                  className="px-4 py-2 text-stone-700 text-xs font-semibold hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Vacinação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
