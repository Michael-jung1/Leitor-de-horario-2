import * as pdfjsLib from 'pdfjs-dist';
import { DEFAULT_SIGLAS } from '../data/siglas';
import { CellData, DayOfWeek, DIAS_SEMANA, ExtractedTurmaData, FormattedRow, GridMap, HORARIOS_PADRAO_VESPERTINO } from '../types';

// Configure pdfjs worker
try {
  // Use unpkg/cdnjs worker fallback for reliable cross-browser worker execution in sandbox
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker setup note:', e);
}

/**
 * Port of Python parse_cell logic:
 * Takes cell string text with newline separated lines and extracts (Materia, Professor)
 * Also detects unknown subject acronyms (2 to 6 uppercase letters/dots)
 */
export function parseCell(
  texto: string,
  siglasMap: Record<string, string> = DEFAULT_SIGLAS,
  unknownSiglasSet?: Set<string>
): Array<{ materia: string; prof: string }> {
  if (!texto) return [];
  const linhas = String(texto)
    .split('\n')
    .map(x => x.trim())
    .filter(x => x.length > 0);

  const pares: Array<{ materia: string; prof: string }> = [];
  let materiaAtual: string | null = null;
  let profAtual: string[] = [];

  for (const linha of linhas) {
    const parts = linha.split(/\s+/);
    const sigla = parts[0]?.toUpperCase() || '';

    if (siglasMap[sigla] || sigla === 'LIVRE') {
      if (materiaAtual !== null) {
        pares.push({
          materia: materiaAtual,
          prof: profAtual.join(' ').trim()
        });
      }
      materiaAtual = siglasMap[sigla] || 'Livre';
      profAtual = [];

      const resto = linha.slice(parts[0].length).trim();
      if (resto) {
        profAtual.push(resto);
      }
    } else if (/^[A-Z.]{2,6}$/.test(sigla)) {
      // Unknown acronym (2 to 6 uppercase letters or dots)
      if (materiaAtual !== null) {
        pares.push({
          materia: materiaAtual,
          prof: profAtual.join(' ').trim()
        });
      }
      materiaAtual = sigla;
      if (unknownSiglasSet) {
        unknownSiglasSet.add(sigla);
      }
      profAtual = [];

      const resto = linha.slice(parts[0].length).trim();
      if (resto) {
        profAtual.push(resto);
      }
    } else {
      if (materiaAtual !== null) {
        profAtual.push(linha);
      } else {
        // Line without subject header
        pares.push({ materia: '', prof: linha });
      }
    }
  }

  if (materiaAtual !== null) {
    pares.push({
      materia: materiaAtual,
      prof: profAtual.join(' ').trim()
    });
  }

  return pares;
}

/**
 * Helper to capitalize professor names properly
 */
export function formatProfessorName(name: string): string {
  if (!name || !name.trim()) return 'Não Informado';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function buildFormattedRows(grid: GridMap, horarios: string[]): FormattedRow[] {
  return horarios.map(h => {
    const row: FormattedRow = {
      'Horário': h,
      'Segunda': formatCellString(grid[h]?.['Segunda']),
      'Terça': formatCellString(grid[h]?.['Terça']),
      'Quarta': formatCellString(grid[h]?.['Quarta']),
      'Quinta': formatCellString(grid[h]?.['Quinta']),
      'Sexta': formatCellString(grid[h]?.['Sexta'])
    };
    return row;
  });
}

function formatCellString(cell?: CellData): string {
  if (!cell || !cell.materia || cell.materia === 'Livre' || cell.materia.toLowerCase() === 'livre') {
    return 'Livre';
  }
  const profName = cell.prof ? formatProfessorName(cell.prof) : 'Não Informado';
  return `${cell.materia} | ${profName}`;
}

export function createEmptyGrid(horarios: string[] = HORARIOS_PADRAO_VESPERTINO): GridMap {
  const grid: GridMap = {};
  for (const h of horarios) {
    grid[h] = {
      'Segunda': { materia: 'Livre', prof: '' },
      'Terça': { materia: 'Livre', prof: '' },
      'Quarta': { materia: 'Livre', prof: '' },
      'Quinta': { materia: 'Livre', prof: '' },
      'Sexta': { materia: 'Livre', prof: '' }
    };
  }
  return grid;
}

/**
 * Scans a PDF file and returns list of unique Turmas detected
 */
export async function detectAllTurmasInPdf(fileOrBuffer: File | ArrayBuffer): Promise<string[]> {
  const buffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const turmasFound = new Set<string>();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const fullText = textContent.items.map((item: any) => item.str).join(' ');

    // Match patterns like "Turma: 104", "Turma : 206", "TURMA 305"
    const turmaMatches = fullText.matchAll(/Turma\s*:?\s*([A-Za-z0-9\-_]+)/gi);
    for (const match of turmaMatches) {
      if (match[1] && match[1].trim()) {
        turmasFound.add(match[1].trim());
      }
    }
  }

  return Array.from(turmasFound).sort();
}

/**
 * Extract timetable from PDF using item positioning to reconstruct tabular Urânia layout
 */
export async function extractTimetableFromPdf(
  fileOrBuffer: File | ArrayBuffer,
  turmaAlvo: string,
  siglasMap: Record<string, string> = DEFAULT_SIGLAS,
  horariosPadrao: string[] = HORARIOS_PADRAO_VESPERTINO
): Promise<ExtractedTurmaData | null> {
  const buffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const dias = DIAS_SEMANA;
  const grade = createEmptyGrid(horariosPadrao);
  let foundTarget = false;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Check if this page contains our target turma
    const fullPageText = textContent.items.map((it: any) => it.str).join(' ');
    const turmaRegex = new RegExp(`Turma\\s*:?\\s*${turmaAlvo}\\b`, 'i');
    if (!turmaRegex.test(fullPageText) && !fullPageText.includes(`Turma: ${turmaAlvo}`) && !fullPageText.includes(`Turma ${turmaAlvo}`)) {
      continue;
    }

    foundTarget = true;

    // Group items by horizontal rows (y-coordinate) and vertical columns (x-coordinate)
    const items = textContent.items as Array<{
      str: string;
      transform: number[]; // [scaleX, skewY, skewX, scaleY, transX, transY]
      width: number;
      height: number;
    }>;

    // Sort items by top-to-bottom (transY desc), then left-to-right (transX asc)
    const sorted = [...items].sort((a, b) => {
      const yDiff = Math.abs(a.transform[5] - b.transform[5]);
      if (yDiff < 4) {
        return a.transform[4] - b.transform[4];
      }
      return b.transform[5] - a.transform[5];
    });

    // Extract text lines
    const lineGroups: Array<{ y: number; items: typeof items }> = [];
    for (const item of sorted) {
      if (!item.str || !item.str.trim()) continue;
      const y = item.transform[5];
      let group = lineGroups.find(g => Math.abs(g.y - y) < 5);
      if (!group) {
        group = { y, items: [] };
        lineGroups.push(group);
      }
      group.items.push(item);
    }

    // Attempt intelligent timetable extraction from page lines
    const parsedFromText = parseRawTextTimetable(
      lineGroups.map(g => g.items.map(i => i.str).join('   ')).join('\n'),
      turmaAlvo,
      siglasMap,
      horariosPadrao
    );

    if (parsedFromText) {
      return parsedFromText;
    }
  }

  if (!foundTarget) {
    return null;
  }

  // If page was found but structure was custom, return grid with formatted rows
  const formattedRows = buildFormattedRows(grade, horariosPadrao);
  return {
    turma: turmaAlvo,
    grade,
    horarios: horariosPadrao,
    formattedRows,
    timestamp: new Date().toISOString(),
    sourceType: 'pdf'
  };
}

/**
 * Intelligent text-based parser for Urânia timetable format or pasted schedule tables
 */
export function parseRawTextTimetable(
  rawText: string,
  turmaAlvo: string,
  siglasMap: Record<string, string> = DEFAULT_SIGLAS,
  horariosPadrao: string[] = HORARIOS_PADRAO_VESPERTINO
): ExtractedTurmaData | null {
  const dias = DIAS_SEMANA;
  const grade = createEmptyGrid(horariosPadrao);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const unknownSiglasSet = new Set<string>();

  // Detect time slots in text if different from standard
  const detectedHorarios: string[] = [];
  const timeRegex = /\b(\d{1,2}:\d{2})\b/g;

  for (const line of lines) {
    const matches = line.match(timeRegex);
    if (matches) {
      for (const m of matches) {
        if (!detectedHorarios.includes(m)) {
          detectedHorarios.push(m);
        }
      }
    }
  }

  const activeHorarios = detectedHorarios.length >= 4 ? detectedHorarios.slice(0, 8) : horariosPadrao;

  // Search through lines for subject codes & professors
  let currentHourIdx = 0;
  let matchesCount = 0;

  for (const line of lines) {
    // Check if line starts with or contains a time
    const timeMatch = line.match(/^(\d{1,2}:\d{2})/);
    if (timeMatch && activeHorarios.includes(timeMatch[1])) {
      currentHourIdx = activeHorarios.indexOf(timeMatch[1]);
    }

    const currentHour = activeHorarios[currentHourIdx] || activeHorarios[0];

    // Check words in line for subject acronyms
    const words = line.split(/\s+/);
    for (let w = 0; w < words.length; w++) {
      const upperWord = words[w].toUpperCase().replace(/[^A-Z.]/g, '');
      if (siglasMap[upperWord] && upperWord !== 'LIVRE') {
        const subject = siglasMap[upperWord];
        const possibleProf = words.slice(w + 1, w + 4).join(' ');
        const dayIdx = matchesCount % dias.length;
        const dia = dias[dayIdx];

        if (grade[currentHour]) {
          grade[currentHour][dia] = {
            materia: subject,
            prof: possibleProf || 'Não Informado',
            rawSigla: upperWord
          };
          matchesCount++;
        }
      } else if (/^[A-Z.]{2,6}$/.test(upperWord) && !['HOR', 'TURMA', 'SALA', 'PROF'].includes(upperWord)) {
        unknownSiglasSet.add(upperWord);
        const possibleProf = words.slice(w + 1, w + 4).join(' ');
        const dayIdx = matchesCount % dias.length;
        const dia = dias[dayIdx];

        if (grade[currentHour]) {
          grade[currentHour][dia] = {
            materia: upperWord,
            prof: possibleProf || 'Não Informado',
            rawSigla: upperWord
          };
          matchesCount++;
        }
      }
    }
  }

  const formattedRows = buildFormattedRows(grade, activeHorarios);

  return {
    turma: turmaAlvo,
    grade,
    horarios: activeHorarios,
    formattedRows,
    timestamp: new Date().toISOString(),
    sourceType: 'text',
    unknownSiglas: Array.from(unknownSiglasSet).sort()
  };
}

/**
 * Generates downloadable iCalendar format (.ics) for importing into Google Calendar or Apple Calendar
 */
export function generateIcs(turmaData: ExtractedTurmaData): string {
  const { turma, grade, horarios } = turmaData;
  const diasMap: Record<DayOfWeek, number> = {
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5
  };

  const dayAbbrMap: Record<DayOfWeek, string> = {
    'Segunda': 'MO',
    'Terça': 'TU',
    'Quarta': 'WE',
    'Quinta': 'TH',
    'Sexta': 'FR'
  };

  const events: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Escola Urânia//Leitor de Horário//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Horário Turma ${turma}`
  ];

  for (const h of horarios) {
    const [hHour, hMin] = h.split(':').map(Number);
    const startHourStr = String(hHour).padStart(2, '0');
    const startMinStr = String(hMin).padStart(2, '0');
    // Assume 45 min duration
    const endMinutes = hHour * 60 + hMin + 45;
    const endHourStr = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endMinStr = String(endMinutes % 60).padStart(2, '0');

    for (const dia of DIAS_SEMANA) {
      const cell = grade[h]?.[dia];
      if (!cell || !cell.materia || cell.materia === 'Livre') continue;

      const prof = cell.prof ? formatProfessorName(cell.prof) : 'Professor';
      const summary = `${cell.materia} (${prof})`;
      const rruleDay = dayAbbrMap[dia];

      events.push(
        'BEGIN:VEVENT',
        `UID:turma-${turma}-${dia}-${h.replace(':', '')}@escola-horario`,
        `DTSTAMP:20261001T000000Z`,
        `DTSTART;TZID=America/Sao_Paulo:20261005T${startHourStr}${startMinStr}00`,
        `DTEND;TZID=America/Sao_Paulo:20261005T${endHourStr}${endMinStr}00`,
        `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:Turma: ${turma}\\nMatéria: ${cell.materia}\\nProfessor: ${prof}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }
  }

  events.push('END:VCALENDAR');
  return events.join('\r\n');
}

/**
 * Converts formattedRows to CSV
 */
export function generateCsv(formattedRows: FormattedRow[]): string {
  if (!formattedRows.length) return '';
  const headers = ['Horário', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const rows = formattedRows.map(r =>
    headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
