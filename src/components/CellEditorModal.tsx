import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, BookOpen, User } from 'lucide-react';
import { CellData, DayOfWeek } from '../types';

interface CellEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  horario: string;
  dia: DayOfWeek;
  currentCell: CellData | null;
  onSave: (horario: string, dia: DayOfWeek, newCell: CellData) => void;
  knownSubjects: string[];
}

export const CellEditorModal: React.FC<CellEditorModalProps> = ({
  isOpen,
  onClose,
  horario,
  dia,
  currentCell,
  onSave,
  knownSubjects
}) => {
  const [materia, setMateria] = useState('');
  const [prof, setProf] = useState('');

  useEffect(() => {
    if (currentCell) {
      setMateria(currentCell.materia === 'Livre' ? '' : currentCell.materia);
      setProf(currentCell.prof || '');
    } else {
      setMateria('');
      setProf('');
    }
  }, [currentCell, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(horario, dia, {
      materia: materia.trim() || 'Livre',
      prof: prof.trim()
    });
    onClose();
  };

  const handleSetLivre = () => {
    onSave(horario, dia, {
      materia: 'Livre',
      prof: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-slate-750 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Editar Horário</h3>
            <p className="text-xs text-indigo-400 font-medium">
              {dia}-feira às {horario}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matéria / Disciplina</span>
            </label>
            <input
              type="text"
              list="subjects-list"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ex: Matemática, Biologia, Física..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <datalist id="subjects-list">
              {knownSubjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nome do Professor</span>
            </label>
            <input
              type="text"
              value={prof}
              onChange={(e) => setProf(e.target.value)}
              placeholder="Ex: Carlos Alberto, Maria Helena..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSetLivre}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Marcar como Livre</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
