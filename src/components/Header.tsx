import React from 'react';
import { BookOpen, ExternalLink, Printer, Settings, Sparkles, Calendar } from 'lucide-react';

interface HeaderProps {
  onOpenSiglasModal: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSiglasModal, onPrint }) => {
  return (
    <header className="no-print bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Leitor de Horário Escolar</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Urânia AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Extrator inteligente de horários e professores</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <a
            href="https://app-escola-phi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
          >
            <span>⬅️ App Principal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={onPrint}
            title="Imprimir grade horária"
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSiglasModal}
            title="Configurar Siglas das Matérias"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Dicionário de Siglas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
