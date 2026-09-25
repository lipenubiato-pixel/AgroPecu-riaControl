import React, { useState } from 'react';
import { Sprout, Plus, CheckCircle2, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { CropField, CropStage } from '../types';

interface CropsModuleProps {
  crops: CropField[];
  onAddCrop: (crop: Omit<CropField, 'id' | 'farmId' | 'updatedAt'>) => void;
  onUpdateCrop: (
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
  ) => void;
  onUpdateStage: (cropId: string, newStage: CropStage) => void;
  onDeleteCrop: (cropId: string) => void;
}

export const CropsModule: React.FC<CropsModuleProps> = ({
  crops,
  onAddCrop,
  onUpdateCrop,
  onUpdateStage,
  onDeleteCrop,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropField | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos do Formulário
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [areaHectares, setAreaHectares] = useState('');
  const [stage, setStage] = useState<CropStage>('preparo');
  const [plantingDate, setPlantingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [soilType, setSoilType] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const stages: { key: CropStage; label: string; desc: string }[] = [
    { key: 'preparo', label: '1. Preparo', desc: 'Preparo do solo e adubação de base' },
    { key: 'plantio', label: '2. Plantio', desc: 'Semeadura e emergência da cultura' },
    { key: 'pulverizacao', label: '3. Pulverização', desc: 'Tratos culturais e defensivos' },
    { key: 'colheita', label: '4. Colheita', desc: 'Maturação e colheita do grão' },
  ];

  const openCreateModal = () => {
    setEditingCrop(null);
    setName('');
    setCrop('');
    setVariety('');
    setAreaHectares('');
    setStage('preparo');
    setPlantingDate('');
    setExpectedHarvestDate('');
    setSoilType('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (target: CropField) => {
    setEditingCrop(target);
    setName(target.name);
    setCrop(target.crop);
    setVariety(target.variety || '');
    setAreaHectares(target.areaHectares.toString());
    setStage(target.currentStage);
    setPlantingDate(target.plantingDate || '');
    setExpectedHarvestDate(target.expectedHarvestDate || '');
    setSoilType(target.soilType || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCrop(null);
    setFormError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Impedir envio duplicado

    // Validação dos campos obrigatórios
    if (!name.trim()) {
      setFormError('Informe a identificação do talhão (ex: Talhão 01).');
      return;
    }
    if (!crop.trim()) {
      setFormError('Informe a cultura agrícola (ex: Soja, Milho, Algodão).');
      return;
    }

    // Regra RN01: área maior que zero
    const areaNum = parseFloat(areaHectares);
    if (isNaN(areaNum) || areaNum <= 0) {
      setFormError('A área cultivada em hectares deve ser um número estritamente maior que zero.');
      return;
    }

    setIsSubmitting(true);

    if (editingCrop) {
      // UPDATE: Altera apenas o registro selecionado, preserva campos não editados
      onUpdateCrop(editingCrop.id, {
        name: name.trim(),
        crop: crop.trim(),
        areaHectares: areaNum,
        currentStage: stage,
        variety: variety.trim() || undefined,
        plantingDate: plantingDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        soilType: soilType.trim() || undefined,
      });
    } else {
      // CREATE: Novo registro
      onAddCrop({
        name: name.trim(),
        crop: crop.trim(),
        areaHectares: areaNum,
        currentStage: stage,
        variety: variety.trim() || undefined,
        plantingDate: plantingDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        soilType: soilType.trim() || undefined,
      });
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sprout className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">
              Controle de Lavouras e Talhões
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre talhões, acompanhe o avanço do ciclo agrícola e registre atividades de manejo.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Novo Talhão</span>
        </button>
      </div>

      {/* READ: Listagem de Talhões ou Estado Vazio */}
      {crops.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-stone-300">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-stone-800">Nenhum talhão cadastrado</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Cadastre o primeiro talhão da propriedade para iniciar o monitoramento de plantio, pulverização e colheita.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Cadastrar Primeiro Talhão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {crops.map((field) => (
            <div
              key={field.id}
              className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">{field.name}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Cultura: {field.crop}
                      </span>
                      {field.variety && (
                        <span className="inline-block text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          Var: {field.variety}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-stone-900">{field.areaHectares}</span>
                    <span className="text-xs text-stone-500 ml-1">ha</span>
                  </div>
                </div>

                {/* Detalhes Agronômicos Expandidos */}
                {(field.soilType || field.plantingDate || field.expectedHarvestDate) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-150">
                    {field.soilType && (
                      <div>
                        <span className="text-stone-400 block font-medium">Solo:</span>
                        <span className="text-stone-700 font-semibold truncate block">{field.soilType}</span>
                      </div>
                    )}
                    {field.plantingDate && (
                      <div>
                        <span className="text-stone-400 block font-medium">Plantio:</span>
                        <span className="text-stone-700 font-semibold block">
                          {new Date(field.plantingDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {field.expectedHarvestDate && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-stone-400 block font-medium">Previsão Colheita:</span>
                        <span className="text-emerald-700 font-semibold block">
                          {new Date(field.expectedHarvestDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* UPDATE Direto: Linha do Tempo das Fases */}
                <div className="mt-5 space-y-2">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                    Fase do Ciclo Produtivo:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                    {stages.map((stg) => {
                      const isCurrent = field.currentStage === stg.key;
                      return (
                        <button
                          key={stg.key}
                          onClick={() => onUpdateStage(field.id, stg.key)}
                          className={`text-center py-1.5 px-1 rounded text-xs font-medium transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-700 text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-stone-200'
                          }`}
                          title={`Mudar para ${stg.label}`}
                        >
                          <span className="block truncate">{stg.label.split('. ')[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rodapé do Cartão com Edição e Exclusão com Confirmação */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400">
                  Atualizado em: {new Date(field.updatedAt).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center space-x-2">
                  {/* Botão de Editar Registro */}
                  <button
                    onClick={() => openEditModal(field)}
                    className="text-stone-500 hover:text-emerald-700 p-1 transition-colors cursor-pointer"
                    title="Editar informações do talhão"
                  >
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* DELETE: Confirmação protegida */}
                  {deleteConfirmId === field.id ? (
                    <div className="flex items-center space-x-1.5 bg-red-50 p-1 rounded border border-red-200">
                      <span className="text-red-700 font-semibold text-[11px]">Excluir?</span>
                      <button
                        onClick={() => {
                          onDeleteCrop(field.id);
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
                      onClick={() => setDeleteConfirmId(field.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Excluir talhão"
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

      {/* Modal CREATE / UPDATE de Talhão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">
                {editingCrop ? 'Editar Talhão' : 'Novo Talhão de Lavoura'}
              </h2>
              <button
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold cursor-pointer"
                title="Fechar"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="talhao-nome" className="block text-xs font-semibold text-stone-700 mb-1">
                  Identificação do Talhão *
                </label>
                <input
                  id="talhao-nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Talhão 03 - Baixada"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="talhao-cultura" className="block text-xs font-semibold text-stone-700 mb-1">
                    Cultura *
                  </label>
                  <input
                    id="talhao-cultura"
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder="Ex: Soja, Milho"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="talhao-variedade" className="block text-xs font-semibold text-stone-700 mb-1">
                    Cultivar / Variedade
                  </label>
                  <input
                    id="talhao-variedade"
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Ex: TMG 7062 IPRO"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="talhao-area" className="block text-xs font-semibold text-stone-700 mb-1">
                    Área (Hectares) *
                  </label>
                  <input
                    id="talhao-area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(e.target.value)}
                    placeholder="Ex: 45"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="talhao-solo" className="block text-xs font-semibold text-stone-700 mb-1">
                    Tipo de Solo
                  </label>
                  <input
                    id="talhao-solo"
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    placeholder="Ex: Argiloso, Arenoso"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="talhao-data-plantio" className="block text-xs font-semibold text-stone-700 mb-1">
                    Data de Plantio
                  </label>
                  <input
                    id="talhao-data-plantio"
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="talhao-previsao-colheita" className="block text-xs font-semibold text-stone-700 mb-1">
                    Previsão de Colheita
                  </label>
                  <input
                    id="talhao-previsao-colheita"
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="talhao-fase" className="block text-xs font-semibold text-stone-700 mb-1">
                  Fase do Ciclo *
                </label>
                <select
                  id="talhao-fase"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as CropStage)}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="preparo">1. Preparo do Solo</option>
                  <option value="plantio">2. Plantio / Semeadura</option>
                  <option value="pulverizacao">3. Pulverização / Tratos</option>
                  <option value="colheita">4. Colheita</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-stone-700 text-xs font-semibold hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingCrop ? 'Atualizar Talhão' : 'Salvar Talhão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
