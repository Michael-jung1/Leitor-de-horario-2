import { ExtractedTurmaData, GridMap, HORARIOS_PADRAO_VESPERTINO } from '../types';
import { buildFormattedRows } from '../utils/parser';

export const SAMPLE_TIMETABLES: Record<string, ExtractedTurmaData> = {
  "104": createSampleForTurma("104", [
    { h: "13:00", d: "Segunda", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:00", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "13:00", d: "Quarta", m: "História", p: "Roberto Silva" },
    { h: "13:00", d: "Quinta", m: "Física", p: "Eduardo Rocha" },
    { h: "13:00", d: "Sexta", m: "Química", p: "Ana Paula" },

    { h: "13:45", d: "Segunda", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:45", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "13:45", d: "Quarta", m: "História", p: "Roberto Silva" },
    { h: "13:45", d: "Quinta", m: "Física", p: "Eduardo Rocha" },
    { h: "13:45", d: "Sexta", m: "Química", p: "Ana Paula" },

    { h: "14:30", d: "Segunda", m: "Biologia", p: "Fernanda Costa" },
    { h: "14:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "14:30", d: "Quarta", m: "Inglês", p: "Patricia Lima" },
    { h: "14:30", d: "Quinta", m: "Sociologia", p: "Marcos Vinicius" },
    { h: "14:30", d: "Sexta", m: "Ed. Física", p: "Julio Cesar" },

    { h: "15:30", d: "Segunda", m: "Biologia", p: "Fernanda Costa" },
    { h: "15:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "15:30", d: "Quarta", m: "Inglês", p: "Patricia Lima" },
    { h: "15:30", d: "Quinta", m: "Filosofia", p: "Marcos Vinicius" },
    { h: "15:30", d: "Sexta", m: "Ed. Física", p: "Julio Cesar" },

    { h: "16:15", d: "Segunda", m: "Artes", p: "Beatriz Nogueira" },
    { h: "16:15", d: "Terça", m: "Matemática", p: "Carlos Alberto" },
    { h: "16:15", d: "Quarta", m: "Português", p: "Maria Helena" },
    { h: "16:15", d: "Quinta", m: "Química", p: "Ana Paula" },
    { h: "16:15", d: "Sexta", m: "Espanhol", p: "Claudia Ramos" },

    { h: "17:00", d: "Segunda", m: "Artes", p: "Beatriz Nogueira" },
    { h: "17:00", d: "Terça", m: "Livre", p: "" },
    { h: "17:00", d: "Quarta", m: "Português", p: "Maria Helena" },
    { h: "17:00", d: "Quinta", m: "Livre", p: "" },
    { h: "17:00", d: "Sexta", m: "Livre", p: "" }
  ]),
  "206": createSampleForTurma("206", [
    { h: "13:00", d: "Segunda", m: "Física", p: "Eduardo Rocha" },
    { h: "13:00", d: "Terça", m: "Química", p: "Ana Paula" },
    { h: "13:00", d: "Quarta", m: "Biologia", p: "Fernanda Costa" },
    { h: "13:00", d: "Quinta", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:00", d: "Sexta", m: "Português", p: "Maria Helena" },

    { h: "13:45", d: "Segunda", m: "Física", p: "Eduardo Rocha" },
    { h: "13:45", d: "Terça", m: "Química", p: "Ana Paula" },
    { h: "13:45", d: "Quarta", m: "Biologia", p: "Fernanda Costa" },
    { h: "13:45", d: "Quinta", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:45", d: "Sexta", m: "Português", p: "Maria Helena" },

    { h: "14:30", d: "Segunda", m: "História", p: "Roberto Silva" },
    { h: "14:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "14:30", d: "Quarta", m: "Sociologia", p: "Marcos Vinicius" },
    { h: "14:30", d: "Quinta", m: "Ed. Física", p: "Julio Cesar" },
    { h: "14:30", d: "Sexta", m: "Inglês", p: "Patricia Lima" },

    { h: "15:30", d: "Segunda", m: "História", p: "Roberto Silva" },
    { h: "15:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "15:30", d: "Quarta", m: "Filosofia", p: "Marcos Vinicius" },
    { h: "15:30", d: "Quinta", m: "Ed. Física", p: "Julio Cesar" },
    { h: "15:30", d: "Sexta", m: "Inglês", p: "Patricia Lima" },

    { h: "16:15", d: "Segunda", m: "Espanhol", p: "Claudia Ramos" },
    { h: "16:15", d: "Terça", m: "Artes", p: "Beatriz Nogueira" },
    { h: "16:15", d: "Quarta", m: "Matemática", p: "Carlos Alberto" },
    { h: "16:15", d: "Quinta", m: "Português", p: "Maria Helena" },
    { h: "16:15", d: "Sexta", m: "Redação", p: "Maria Helena" },

    { h: "17:00", d: "Segunda", m: "Livre", p: "" },
    { h: "17:00", d: "Terça", m: "Livre", p: "" },
    { h: "17:00", d: "Quarta", m: "Redação", p: "Maria Helena" },
    { h: "17:00", d: "Quinta", m: "Livre", p: "" },
    { h: "17:00", d: "Sexta", m: "Livre", p: "" }
  ]),
  "305": createSampleForTurma("305", [
    { h: "13:00", d: "Segunda", m: "Química", p: "Ana Paula" },
    { h: "13:00", d: "Terça", m: "Física", p: "Eduardo Rocha" },
    { h: "13:00", d: "Quarta", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:00", d: "Quinta", m: "Biologia", p: "Fernanda Costa" },
    { h: "13:00", d: "Sexta", m: "História", p: "Roberto Silva" },

    { h: "13:45", d: "Segunda", m: "Química", p: "Ana Paula" },
    { h: "13:45", d: "Terça", m: "Física", p: "Eduardo Rocha" },
    { h: "13:45", d: "Quarta", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:45", d: "Quinta", m: "Biologia", p: "Fernanda Costa" },
    { h: "13:45", d: "Sexta", m: "História", p: "Roberto Silva" },

    { h: "14:30", d: "Segunda", m: "Redação", p: "Maria Helena" },
    { h: "14:30", d: "Terça", m: "Sociologia", p: "Marcos Vinicius" },
    { h: "14:30", d: "Quarta", m: "Geografia", p: "Lucas Mendes" },
    { h: "14:30", d: "Quinta", m: "Inglês", p: "Patricia Lima" },
    { h: "14:30", d: "Sexta", m: "Matemática", p: "Carlos Alberto" },

    { h: "15:30", d: "Segunda", m: "Redação", p: "Maria Helena" },
    { h: "15:30", d: "Terça", m: "Filosofia", p: "Marcos Vinicius" },
    { h: "15:30", d: "Quarta", m: "Geografia", p: "Lucas Mendes" },
    { h: "15:30", d: "Quinta", m: "Inglês", p: "Patricia Lima" },
    { h: "15:30", d: "Sexta", m: "Matemática", p: "Carlos Alberto" },

    { h: "16:15", d: "Segunda", m: "Ed. Física", p: "Julio Cesar" },
    { h: "16:15", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "16:15", d: "Quarta", m: "Física", p: "Eduardo Rocha" },
    { h: "16:15", d: "Quinta", m: "Biologia", p: "Fernanda Costa" },
    { h: "16:15", d: "Sexta", m: "Química", p: "Ana Paula" },

    { h: "17:00", d: "Segunda", m: "Ed. Física", p: "Julio Cesar" },
    { h: "17:00", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "17:00", d: "Quarta", m: "Livre", p: "" },
    { h: "17:00", d: "Quinta", m: "Livre", p: "" },
    { h: "17:00", d: "Sexta", m: "Livre", p: "" }
  ])
};

function createSampleForTurma(turma: string, entries: Array<{ h: string; d: any; m: string; p: string }>): ExtractedTurmaData {
  const horarios = HORARIOS_PADRAO_VESPERTINO;
  const grade: GridMap = {};

  for (const h of horarios) {
    grade[h] = {
      'Segunda': { materia: 'Livre', prof: '' },
      'Terça': { materia: 'Livre', prof: '' },
      'Quarta': { materia: 'Livre', prof: '' },
      'Quinta': { materia: 'Livre', prof: '' },
      'Sexta': { materia: 'Livre', prof: '' }
    };
  }

  for (const e of entries) {
    if (grade[e.h] && grade[e.h][e.d as keyof GridMap[string]]) {
      grade[e.h][e.d as keyof GridMap[string]] = {
        materia: e.m,
        prof: e.p
      };
    }
  }

  const formattedRows = buildFormattedRows(grade, horarios);

  return {
    turma,
    grade,
    horarios,
    formattedRows,
    timestamp: new Date().toISOString(),
    sourceType: 'sample'
  };
}

export function getSampleOrGenerate(turma: string): ExtractedTurmaData {
  if (SAMPLE_TIMETABLES[turma]) {
    return SAMPLE_TIMETABLES[turma];
  }
  // Generate on demand for other turmas
  return createSampleForTurma(turma, [
    { h: "13:00", d: "Segunda", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:00", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "13:00", d: "Quarta", m: "História", p: "Roberto Silva" },
    { h: "13:00", d: "Quinta", m: "Física", p: "Eduardo Rocha" },
    { h: "13:00", d: "Sexta", m: "Química", p: "Ana Paula" },
    { h: "13:45", d: "Segunda", m: "Matemática", p: "Carlos Alberto" },
    { h: "13:45", d: "Terça", m: "Português", p: "Maria Helena" },
    { h: "13:45", d: "Quarta", m: "História", p: "Roberto Silva" },
    { h: "13:45", d: "Quinta", m: "Física", p: "Eduardo Rocha" },
    { h: "13:45", d: "Sexta", m: "Química", p: "Ana Paula" },
    { h: "14:30", d: "Segunda", m: "Biologia", p: "Fernanda Costa" },
    { h: "14:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "14:30", d: "Quarta", m: "Inglês", p: "Patricia Lima" },
    { h: "14:30", d: "Quinta", m: "Sociologia", p: "Marcos Vinicius" },
    { h: "14:30", d: "Sexta", m: "Ed. Física", p: "Julio Cesar" },
    { h: "15:30", d: "Segunda", m: "Biologia", p: "Fernanda Costa" },
    { h: "15:30", d: "Terça", m: "Geografia", p: "Lucas Mendes" },
    { h: "15:30", d: "Quarta", m: "Inglês", p: "Patricia Lima" },
    { h: "15:30", d: "Quinta", m: "Filosofia", p: "Marcos Vinicius" },
    { h: "15:30", d: "Sexta", m: "Ed. Física", p: "Julio Cesar" },
    { h: "16:15", d: "Segunda", m: "Artes", p: "Beatriz Nogueira" },
    { h: "16:15", d: "Terça", m: "Matemática", p: "Carlos Alberto" },
    { h: "16:15", d: "Quarta", m: "Português", p: "Maria Helena" },
    { h: "16:15", d: "Quinta", m: "Química", p: "Ana Paula" },
    { h: "16:15", d: "Sexta", m: "Espanhol", p: "Claudia Ramos" },
    { h: "17:00", d: "Segunda", m: "Artes", p: "Beatriz Nogueira" },
    { h: "17:00", d: "Terça", m: "Livre", p: "" },
    { h: "17:00", d: "Quarta", m: "Português", p: "Maria Helena" },
    { h: "17:00", d: "Quinta", m: "Livre", p: "" },
    { h: "17:00", d: "Sexta", m: "Livre", p: "" }
  ]);
}
