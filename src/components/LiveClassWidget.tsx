import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, User, ArrowRight, Bell, Calendar } from 'lucide-react';
import { DayOfWeek, ExtractedTurmaData } from '../types';
import { getSubjectColor } from '../data/siglas';

interface LiveClassWidgetProps {
  turmaData: ExtractedTurmaData | null;
}

const DIAS_PT: Record<number, DayOfWeek | null> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  0: null, // Domingo
  6: null  // Sábado
};

export const LiveClassWidget: React.FC<LiveClassWidgetProps> = ({ turmaData }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!turmaData) return null;

  const dayNumber = currentTime.getDay();
  const currentDayName = DIAS_PT[dayNumber];
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Format display time
  const formattedTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  if (!currentDayName) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Fim de Semana</h4>
            <p className="text-xs text-slate-400">Nenhuma aula programada para hoje ({turmaData.turma})</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {formattedTimeStr}
          </span>
        </div>
      </div>
    );
  }

  // Parse time slots
  const slots = turmaData.horarios.map(h => {
    const [hHour, hMin] = h.split(':').map(Number);
    const startMin = hHour * 60 + hMin;
    const endMin = startMin + 45; // 45 min class duration
    return {
      timeStr: h,
      startMin,
      endMin,
      cell: turmaData.grade[h]?.[currentDayName]
    };
  });

  const currentSlot = slots.find(s => totalMinutes >= s.startMin && totalMinutes < s.endMin);
  const nextSlot = slots.find(s => s.startMin > totalMinutes);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-indigo-500/20 rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <span>Ao Vivo • {currentDayName}-feira</span>
            <span className="text-xs font-normal text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Turma {turmaData.turma}
            </span>
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{formattedTimeStr}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {/* Current Class */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Aula em Andamento</span>
            {currentSlot && <span className="text-xs text-indigo-300">{currentSlot.timeStr}</span>}
          </span>

          {currentSlot && currentSlot.cell && currentSlot.cell.materia !== 'Livre' ? (
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <span className={`text-base font-bold px-2.5 py-0.5 rounded-md border ${getSubjectColor(currentSlot.cell.materia).badge}`}>
                  {currentSlot.cell.materia}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Prof. {currentSlot.cell.prof || 'Não Informado'}</span>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center space-x-2 text-slate-400 text-sm italic">
              <span>Nenhuma aula ocorrendo neste instante (Livre ou intervalo)</span>
            </div>
          )}
        </div>

        {/* Next Class */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Próxima Aula</span>
            {nextSlot && <span className="text-xs text-amber-300">{nextSlot.timeStr}</span>}
          </span>

          {nextSlot && nextSlot.cell && nextSlot.cell.materia !== 'Livre' ? (
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <span className={`text-base font-bold px-2.5 py-0.5 rounded-md border ${getSubjectColor(nextSlot.cell.materia).badge}`}>
                  {nextSlot.cell.materia}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Prof. {nextSlot.cell.prof || 'Não Informado'}</span>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center space-x-2 text-slate-400 text-sm italic">
              <span>Sem próximas aulas para o restante do dia</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
