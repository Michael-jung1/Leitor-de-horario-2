import { SiglaDefinition } from '../types';

export const DEFAULT_SIGLAS: Record<string, string> = {
  'BIO': 'Biologia',
  'BIOLOGIA': 'Biologia',
  'ED.F': 'Ed. Física',
  'ED.F.': 'Ed. Física',
  'ED FIS': 'Ed. Física',
  'PORT': 'Português',
  'LP': 'Língua Portuguesa',
  'ART': 'Artes',
  'ARTE': 'Artes',
  'MAT': 'Matemática',
  'GEO': 'Geografia',
  'SOC': 'Sociologia',
  'HIST': 'História',
  'FIL': 'Filosofia',
  'ING': 'Inglês',
  'FIS': 'Física',
  'QUI': 'Química',
  'ESP': 'Espanhol',
  'ENS.REL': 'Ensino Religioso',
  'REL': 'Ensino Religioso',
  'RED': 'Redação',
  'LIT': 'Literatura',
  'LIVRE': 'Livre'
};

export const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Matemática': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  'Português': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  'Língua Portuguesa': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  'Física': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30', badge: 'bg-indigo-500/20 text-indigo-300' },
  'Química': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  'Biologia': { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-300' },
  'História': { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300' },
  'Geografia': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30', badge: 'bg-teal-500/20 text-teal-300' },
  'Filosofia': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  'Sociologia': { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30', badge: 'bg-violet-500/20 text-violet-300' },
  'Inglês': { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30', badge: 'bg-sky-500/20 text-sky-300' },
  'Espanhol': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-300' },
  'Artes': { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30', badge: 'bg-pink-500/20 text-pink-300' },
  'Ed. Física': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-300' },
  'Redação': { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30', badge: 'bg-fuchsia-500/20 text-fuchsia-300' },
  'Literatura': { bg: 'bg-blue-400/15', text: 'text-blue-200', border: 'border-blue-400/30', badge: 'bg-blue-400/20 text-blue-200' },
  'Livre': { bg: 'bg-slate-800/40', text: 'text-slate-500', border: 'border-slate-800/60', badge: 'bg-slate-800/80 text-slate-400' },
  'default': { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700/50', badge: 'bg-slate-800 text-slate-300' }
};

export function getSubjectColor(subject: string) {
  const clean = subject ? subject.trim() : 'Livre';
  if (!clean || clean.toLowerCase() === 'livre') return SUBJECT_COLORS['Livre'];
  return SUBJECT_COLORS[clean] || SUBJECT_COLORS['default'];
}
