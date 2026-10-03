export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta';

export const DIAS_SEMANA: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export const HORARIOS_PADRAO_VESPERTINO = ["13:00", "13:45", "14:30", "15:30", "16:15", "17:00"];
export const HORARIOS_PADRAO_MATUTINO = ["07:00", "07:45", "08:30", "09:30", "10:15", "11:00"];
export const HORARIOS_PADRAO_NOTURNO = ["19:00", "19:45", "20:30", "21:20", "22:05"];

export const TURMAS_PREDEFINIDAS = [
  "104", "105", "106", "107", "108", "109",
  "206", "207", "208", "209",
  "305", "306"
];

export interface CellData {
  materia: string;
  prof: string;
  rawSigla?: string;
  room?: string;
}

export type GridMap = Record<string, Record<DayOfWeek, CellData>>;

export interface FormattedRow {
  Horário: string;
  Segunda: string;
  Terça: string;
  Quarta: string;
  Quinta: string;
  Sexta: string;
  [key: string]: string;
}

export interface ExtractedTurmaData {
  turma: string;
  grade: GridMap;
  horarios: string[];
  formattedRows: FormattedRow[];
  timestamp: string;
  sourceType: 'pdf' | 'sample' | 'manual' | 'text';
  fileName?: string;
  unknownSiglas?: string[];
}

export interface SiglaDefinition {
  sigla: string;
  nome: string;
  color?: string;
}
