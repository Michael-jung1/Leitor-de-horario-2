import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Check, BookMarked, Search } from 'lucide-react';
import { DEFAULT_SIGLAS } from '../data/siglas';

interface SiglasManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  siglas: Record<string, string>;
  onSaveSiglas: (newSiglas: Record<string, string>) => void;
}

export const SiglasManagerModal: React.FC<SiglasManagerModalProps> = ({
  isOpen,
  onClose,
  siglas,
  onSaveSiglas
}) => {
  const [localSiglas, setLocalSiglas] = useState<Record<string, string>>({ ...siglas });
  const [newSigla, setNewSigla] = useState('');
  const [newNome, setNewNome] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSigla = newSigla.trim().toUpperCase();
    const cleanNome = newNome.trim();
    if (!cleanSigla || !cleanNome) return;

    setLocalSiglas(prev => ({
      ...prev,
      [cleanSigla]: cleanNome
    }));
    setNewSigla('');
    setNewNome('');
  };

  const handleDelete = (siglaToDelete: string) => {
    setLocalSiglas(prev => {
      const copy = { ...prev };
      delete copy[siglaToDelete];
      return copy;
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar o dicionário padrão de matérias do Urânia?')) {
      setLocalSiglas({ ...DEFAULT_SIGLAS });
    }
  };

  const handleSaveAndClose = () => {
    onSaveSiglas(localSiglas);
    onClose();
  };

  const filteredList = Object.entries(localSiglas).filter(
    ([sigla, nome]) =>
      sigla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-750 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dicionário de Siglas das Matérias</h3>
              <p className="text-xs text-slate-400">Mapeamento automático de siglas do Urânia para nomes completos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Sigla Form */}
        <form onSubmit={handleAdd} className="p-4 bg-slate-900 border-b border-slate-750 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Sigla (ex: FIL)"
            value={newSigla}
            onChange={(e) => setNewSigla(e.target.value.toUpperCase())}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 sm:w-28"
          />
          <input
            type="text"
            placeholder="Nome Completo (ex: Filosofia)"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newSigla.trim() || !newNome.trim()}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </form>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-slate-750 flex items-center space-x-2 bg-slate-850">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por sigla ou matéria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* List of Siglas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800">
          {filteredList.map(([sigla, nome]) => (
            <div key={sigla} className="pt-2 first:pt-0 flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {sigla}
                </span>
                <span className="text-sm font-medium text-slate-200">{nome}</span>
              </div>
              <button
                onClick={() => handleDelete(sigla)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100"
                title="Remover sigla"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filteredList.length === 0 && (
            <p className="text-xs text-center text-slate-500 py-6">Nenhuma sigla encontrada com este termo.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-750 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
