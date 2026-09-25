import React, { useState } from 'react';
import { Sprout, LayoutDashboard, Beef, Tractor, Sparkles, UserCheck, X } from 'lucide-react';
import { FarmUser } from '../types';

export type NavTab = 'dashboard' | 'crops' | 'livestock' | 'machines' | 'agroinsight';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: FarmUser;
  onUpdateUser: (name: string, farmName: string) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onUpdateUser,
  onResetData,
}) => {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [farmNameInput, setFarmNameInput] = useState(user.farmName);
  const [formError, setFormError] = useState('');

  const handleOpenEdit = () => {
    setNameInput(user.name);
    setFarmNameInput(user.farmName);
    setFormError('');
    setIsEditUserOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !farmNameInput.trim()) {
      setFormError('Por favor, informe o nome do produtor e o nome da propriedade.');
      return;
    }
    onUpdateUser(nameInput.trim(), farmNameInput.trim());
    setIsEditUserOpen(false);
  };

  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'crops' as NavTab, label: 'Lavouras', icon: Sprout },
    { id: 'livestock' as NavTab, label: 'Rebanho', icon: Beef },
    { id: 'machines' as NavTab, label: 'Máquinas', icon: Tractor },
    { id: 'agroinsight' as NavTab, label: 'AgroInsight', icon: Sparkles },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-sm">
              <Sprout className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-tight">
                AgroContro
              </span>
              <span className="text-xs text-emerald-200 block font-medium">
                {user.farmName}
              </span>
            </div>
          </div>

          {/* Produtor & Ações */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleOpenEdit}
              className="text-left bg-emerald-800/80 hover:bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700/60 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              title="Clique para alterar o proprietário ou o nome da fazenda"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider leading-none">
                  Proprietário
                </span>
                <span className="text-xs font-semibold text-white block truncate max-w-[130px]">
                  {user.name}
                </span>
              </div>
            </button>
            <button
              onClick={onResetData}
              title="Restaura os dados originais da demonstração"
              className="text-xs px-2.5 py-1.5 rounded bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 transition-colors border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Reiniciar Dados
            </button>
          </div>
        </div>

        {/* Barra de Navegação Horizontal Responsiva */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-2 sm:pb-0" aria-label="Navegação Principal">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                  isActive
                    ? 'bg-stone-100 text-emerald-950 font-bold border-t-2 border-emerald-400 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-emerald-300'}`} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal: Alterar Proprietário e Nome da Fazenda */}
      {isEditUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Dados do Proprietário</h3>
                  <p className="text-xs text-stone-500">Altere o produtor responsável e o nome da fazenda.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditUserOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Produtor / Proprietário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Propriedade / Fazenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={farmNameInput}
                  onChange={(e) => setFarmNameInput(e.target.value)}
                  placeholder="Ex: Fazenda Terra Produtiva"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
