import React, { useState } from 'react';
import { Sprout, Beef, Tractor, History, PlusCircle, ArrowUpRight, Trash2 } from 'lucide-react';
import { CropField, LivestockGroup, Machine, ActivityLog } from '../types';

interface DashboardViewProps {
  crops: CropField[];
  livestock: LivestockGroup[];
  machines: Machine[];
  activities: ActivityLog[];
  onNavigate: (tab: 'crops' | 'livestock' | 'machines' | 'agroinsight') => void;
  onClearActivities: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  crops,
  livestock,
  machines,
  activities,
  onNavigate,
  onClearActivities,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Cálculos consolidados
  const totalHectares = crops.reduce((acc, curr) => acc + (Number(curr.areaHectares) || 0), 0);
  const totalAnimals = livestock.reduce((acc, curr) => acc + (Number(curr.headCount) || 0), 0);
  const operationalMachines = machines.filter((m) => m.status === 'operacional').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel com Ação Rápida */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Painel da Propriedade
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Visão consolidada das operações agrícolas, pecuárias e maquinário em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('crops')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Gerenciar Lavouras</span>
          </button>
          <button
            onClick={() => onNavigate('livestock')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-amber-500"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Gerenciar Rebanho</span>
          </button>
          <button
            onClick={() => onNavigate('machines')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-slate-500"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Gerenciar Frota</span>
          </button>
        </div>
      </div>

      {/* 3 Cartões de Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Lavouras */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Área Agrícola
              </span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">
                {totalHectares} <span className="text-lg font-normal text-stone-500">ha</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Distribuídos em {crops.length} {crops.length === 1 ? 'talhão ativo' : 'talhões ativos'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Sprout className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">
              {crops.filter((c) => c.currentStage === 'colheita').length} em colheita
            </span>
            <button
              onClick={() => onNavigate('crops')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center space-x-1"
            >
              <span>Ver talhões</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Card 2: Rebanho */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Rebanho Total
              </span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">
                {totalAnimals} <span className="text-lg font-normal text-stone-500">cabeças</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Em {livestock.length} {livestock.length === 1 ? 'lote de manejo' : 'lotes de manejo'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
              <Beef className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">
              {livestock.filter((l) => l.category === 'corte').length} corte / {livestock.filter((l) => l.category === 'leite').length} leite
            </span>
            <button
              onClick={() => onNavigate('livestock')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center space-x-1"
            >
              <span>Ver rebanho</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Card 3: Máquinas */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Parque de Máquinas
              </span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">
                {operationalMachines} <span className="text-lg font-normal text-stone-500">/{machines.length}</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Máquinas prontas para operação em campo
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
              <Tractor className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">
              {machines.length - operationalMachines} em oficina/manutenção
            </span>
            <button
              onClick={() => onNavigate('machines')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center space-x-1"
            >
              <span>Ver frota</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Seção Diário de Campo / Histórico de Atividades */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-lg font-bold text-stone-900">Diário de Campo & Atividades Recentes</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-stone-500 font-medium">
              {activities.length} {activities.length === 1 ? 'registro' : 'registros'}
            </span>
            {activities.length > 0 && (
              <>
                {showClearConfirm ? (
                  <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    <span className="text-xs text-red-700 font-semibold">Apagar todo o histórico?</span>
                    <button
                      onClick={() => {
                        onClearActivities();
                        setShowClearConfirm(false);
                      }}
                      className="text-xs px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs transition-colors"
                    >
                      Sim, Apagar
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="text-xs px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Apagar todos os registros do diário de campo"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Limpar Diário</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-10">
            <History className="w-10 h-10 text-stone-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-stone-600">Nenhuma atividade registrada ainda.</p>
            <p className="text-xs text-stone-400 mt-1">
              As ações registradas nas lavouras, rebanho e máquinas aparecerão automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 mt-2">
            {activities.map((act) => {
              const moduleBadges = {
                lavoura: { label: 'Lavoura', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                rebanho: { label: 'Rebanho', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                maquina: { label: 'Máquinas', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
              };
              const badge = moduleBadges[act.module];

              return (
                <div key={act.id} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 font-semibold rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-stone-700">
                        {act.targetName}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {act.actionTitle}
                    </p>
                    {act.notes && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-md border border-stone-200">
                        {act.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 whitespace-nowrap self-start sm:self-center">
                    {new Date(act.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
