import React from 'react';
import { Users, Layers, Sparkles, Plus } from 'lucide-react';
import { TURMAS_PREDEFINIDAS } from '../types';

interface TurmaSelectorProps {
  selectedTurma: string;
  onSelectTurma: (turma: string) => void;
  detectedTurmas: string[];
}

export const TurmaSelector: React.FC<TurmaSelectorProps> = ({
  selectedTurma,
  onSelectTurma,
  detectedTurmas
}) => {
  const allTurmas = Array.from(new Set([...detectedTurmas, ...TURMAS_PREDEFINIDAS])).sort();

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Selecione sua Turma:</span>
        </label>
        {detectedTurmas.length > 0 && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {detectedTurmas.length} detectadas no PDF
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Main Selectbox (Directly reproducing st.selectbox) */}
        <div className="relative flex-1">
          <select
            value={selectedTurma}
            onChange={(e) => onSelectTurma(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
          >
            {allTurmas.map((t) => (
              <option key={t} value={t}>
                Turma {t} {detectedTurmas.includes(t) ? '✓ (Presente no arquivo)' : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Chips for rapid switching */}
      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-slate-400 mr-1">Atalhos rápidos:</span>
        {TURMAS_PREDEFINIDAS.slice(0, 8).map((t) => {
          const isSelected = selectedTurma === t;
          return (
            <button
              key={t}
              onClick={() => onSelectTurma(t)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
};
