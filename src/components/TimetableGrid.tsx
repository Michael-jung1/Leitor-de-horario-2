import React, { useState } from 'react';
import { Table, LayoutGrid, Edit3, User, Clock, Check, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { CellData, DayOfWeek, DIAS_SEMANA, ExtractedTurmaData } from '../types';
import { getSubjectColor } from '../data/siglas';

interface TimetableGridProps {
  turmaData: ExtractedTurmaData;
  onEditCell: (horario: string, dia: DayOfWeek, currentCell: CellData) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ turmaData, onEditCell }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const { turma, grade, horarios, formattedRows } = turmaData;

  // Calculate subject counts
  const subjectCounts: Record<string, number> = {};
  let totalClasses = 0;
  let freeClasses = 0;

  for (const h of horarios) {
    for (const d of DIAS_SEMANA) {
      const cell = grade[h]?.[d];
      const mat = cell?.materia || 'Livre';
      if (mat === 'Livre' || !mat) {
        freeClasses++;
      } else {
        totalClasses++;
        subjectCounts[mat] = (subjectCounts[mat] || 0) + 1;
      }
    }
  }

  const uniqueSubjects = Object.keys(subjectCounts).sort();

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-xl overflow-hidden shadow-lg">
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Grade Horária — Turma {turma}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                {totalClasses} aulas semanais
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique em qualquer aula para editar a matéria ou professor
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter by Subject */}
          <div className="relative">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 appearance-none pr-7"
            >
              <option value="all">Todas as Matérias</option>
              {uniqueSubjects.map(s => (
                <option key={s} value={s}>{s} ({subjectCounts[s]} aulas)</option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-750 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Grade Visual"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Tabela Streamlit (DataFrame)"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Timetable Content */}
      {viewMode === 'cards' ? (
        <div className="overflow-x-auto p-4">
          <div className="min-w-[700px]">
            {/* Days Header */}
            <div className="grid grid-cols-6 gap-2 mb-2 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Horário</span>
              </div>
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-xs font-bold uppercase tracking-wider text-slate-200 p-2 bg-slate-900/80 rounded-lg border border-slate-800"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="space-y-2">
              {horarios.map((horario) => (
                <div key={horario} className="grid grid-cols-6 gap-2">
                  {/* Time label */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-center text-xs font-mono font-bold text-indigo-300">
                    {horario}
                  </div>

                  {/* Day cells */}
                  {DIAS_SEMANA.map((dia) => {
                    const cell = grade[horario]?.[dia] || { materia: 'Livre', prof: '' };
                    const isLivre = !cell.materia || cell.materia === 'Livre' || cell.materia.toLowerCase() === 'livre';
                    const colors = getSubjectColor(cell.materia);

                    const isDimmed = subjectFilter !== 'all' && cell.materia !== subjectFilter;

                    return (
                      <div
                        key={dia}
                        onClick={() => onEditCell(horario, dia, cell)}
                        className={`group relative rounded-lg border p-2.5 cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[76px] ${
                          isLivre
                            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                            : `${colors.bg} ${colors.border} hover:scale-[1.02] hover:shadow-md`
                        } ${isDimmed ? 'opacity-25 grayscale' : ''}`}
                      >
                        {/* Subject */}
                        <div>
                          <div className="flex items-start justify-between">
                            <span className={`text-xs sm:text-sm font-bold truncate block ${isLivre ? 'text-slate-500' : colors.text}`}>
                              {isLivre ? 'Livre' : cell.materia}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />
                          </div>
                        </div>

                        {/* Professor */}
                        {!isLivre && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1 truncate">
                            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{cell.prof || 'Não informado'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Streamlit-Style DataFrame View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-750">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-200">Horário</th>
                <th className="px-4 py-3 font-semibold text-slate-200">Segunda</th>
                <th className="px-4 py-3 font-semibold text-slate-200">Terça</th>
                <th className="px-4 py-3 font-semibold text-slate-200">Quarta</th>
                <th className="px-4 py-3 font-semibold text-slate-200">Quinta</th>
                <th className="px-4 py-3 font-semibold text-slate-200">Sexta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {formattedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-400 whitespace-nowrap bg-slate-900/40">
                    {row.Horário}
                  </td>
                  <td className="px-4 py-3">{row.Segunda}</td>
                  <td className="px-4 py-3">{row.Terça}</td>
                  <td className="px-4 py-3">{row.Quarta}</td>
                  <td className="px-4 py-3">{row.Quinta}</td>
                  <td className="px-4 py-3">{row.Sexta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-300">Matérias nesta turma:</span>
          {uniqueSubjects.map(sub => (
            <span
              key={sub}
              onClick={() => setSubjectFilter(subjectFilter === sub ? 'all' : sub)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                subjectFilter === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {sub} ({subjectCounts[sub]})
            </span>
          ))}
        </div>
        <div>
          <span>{freeClasses} horários livres</span>
        </div>
      </div>
    </div>
  );
};
