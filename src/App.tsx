import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveClassWidget } from './components/LiveClassWidget';
import { TurmaSelector } from './components/TurmaSelector';
import { PdfUploader } from './components/PdfUploader';
import { TimetableGrid } from './components/TimetableGrid';
import { ExportModal } from './components/ExportModal';
import { SiglasManagerModal } from './components/SiglasManagerModal';
import { CellEditorModal } from './components/CellEditorModal';
import { CellData, DayOfWeek, ExtractedTurmaData, FormattedRow } from './types';
import { DEFAULT_SIGLAS } from './data/siglas';
import { getSampleOrGenerate, SAMPLE_TIMETABLES } from './data/mockTimetables';
import { buildFormattedRows, detectAllTurmasInPdf, extractTimetableFromPdf, parseRawTextTimetable } from './utils/parser';
import { Download, Sparkles, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export function App() {
  const [selectedTurma, setSelectedTurma] = useState<string>('104');
  const [detectedTurmas, setDetectedTurmas] = useState<string[]>([]);
  const [currentTurmaData, setCurrentTurmaData] = useState<ExtractedTurmaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>({
    type: 'info',
    text: 'Selecione sua turma e clique em "Extrair Meu Horário" ou carregue um PDF do Urânia.'
  });

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSiglasModalOpen, setIsSiglasModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ horario: string; dia: DayOfWeek; cell: CellData } | null>(null);

  // Siglas dictionary state
  const [siglas, setSiglas] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('urania_siglas');
      return saved ? JSON.parse(saved) : DEFAULT_SIGLAS;
    } catch {
      return DEFAULT_SIGLAS;
    }
  });

  // Save siglas to local storage
  const handleSaveSiglas = (newSiglas: Record<string, string>) => {
    setSiglas(newSiglas);
    try {
      localStorage.setItem('urania_siglas', JSON.stringify(newSiglas));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    setStatusMessage({
      type: 'success',
      text: 'Dicionário de siglas atualizado com sucesso!'
    });
  };

  // Initial load with default sample for turma 104
  useEffect(() => {
    const initial = getSampleOrGenerate('104');
    setCurrentTurmaData(initial);
  }, []);

  // When selected turma changes, load or extract
  const handleSelectTurma = async (turma: string) => {
    setSelectedTurma(turma);
    if (loadedFile) {
      // Re-extract from active PDF for new turma
      await extractFromCurrentPdf(loadedFile, turma);
    } else {
      const sample = getSampleOrGenerate(turma);
      setCurrentTurmaData(sample);
      setStatusMessage({
        type: 'info',
        text: `Horário de exemplo carregado para a Turma ${turma}. Você também pode carregar o PDF oficial do Urânia.`
      });
    }
  };

  const handleFileLoaded = async (file: File) => {
    setLoadedFile(file);
    setIsLoading(true);
    setStatusMessage(null);

    try {
      // 1. Detect all turmas in the PDF
      const turmas = await detectAllTurmasInPdf(file);
      setDetectedTurmas(turmas);

      // Pick selectedTurma or first detected
      const targetTurma = turmas.includes(selectedTurma) ? selectedTurma : (turmas[0] || selectedTurma);
      if (targetTurma !== selectedTurma) {
        setSelectedTurma(targetTurma);
      }

      // 2. Extract timetable for that turma
      await extractFromCurrentPdf(file, targetTurma);
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Não foi possível ler o arquivo PDF. Verifique se é um arquivo do Urânia válido.'
      });
      setIsLoading(false);
    }
  };

  const extractFromCurrentPdf = async (file: File, turma: string) => {
    setIsLoading(true);
    try {
      const data = await extractTimetableFromPdf(file, turma, siglas);
      if (data) {
        setCurrentTurmaData(data);
        setStatusMessage({
          type: 'success',
          text: `🎉 Horário da Turma ${turma} mapeado com sucesso a partir de "${file.name}"!`
        });
      } else {
        // Fallback: create grid
        const fallback = getSampleOrGenerate(turma);
        setCurrentTurmaData(fallback);
        setStatusMessage({
          type: 'error',
          text: `Turma ${turma} não encontrada no PDF. Carregamos uma estrutura padrão para você personalizar.`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Erro ao analisar os blocos de turma no PDF.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractText = (rawText: string) => {
    setIsLoading(true);
    try {
      const parsed = parseRawTextTimetable(rawText, selectedTurma, siglas);
      if (parsed) {
        setCurrentTurmaData(parsed);
        setStatusMessage({
          type: 'success',
          text: `🎉 Horário da Turma ${selectedTurma} extraído do texto com sucesso!`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro ao processar o texto colado.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (turma: string) => {
    setSelectedTurma(turma);
    const sample = getSampleOrGenerate(turma);
    setCurrentTurmaData(sample);
    setLoadedFile(null);
    setStatusMessage({
      type: 'success',
      text: `Exemplo da Turma ${turma} carregado!`
    });
  };

  const handleCellEditSave = (horario: string, dia: DayOfWeek, newCell: CellData) => {
    if (!currentTurmaData) return;
    const newGrade = { ...currentTurmaData.grade };
    if (!newGrade[horario]) newGrade[horario] = {} as any;
    newGrade[horario][dia] = newCell;

    const newFormattedRows = buildFormattedRows(newGrade, currentTurmaData.horarios);

    setCurrentTurmaData({
      ...currentTurmaData,
      grade: newGrade,
      formattedRows: newFormattedRows
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header onOpenSiglasModal={() => setIsSiglasModalOpen(true)} onPrint={handlePrint} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Hero banner replicating Streamlit app header */}
        <div className="no-print bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Extrator de Horários Automático do Urânia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              📚 Extrator e Visualizador de Grade Escolar
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Arraste seu PDF gerado pelo Urânia. O sistema mapeará as matérias e os professores perfeitamente, permitindo exportar diretamente em JSON para o aplicativo principal ou em calendário (.ics).
            </p>
          </div>
        </div>

        {/* Status Notification Banner (reproducing st.success, st.error, st.warning) */}
        {statusMessage && (
          <div
            className={`no-print p-4 rounded-xl text-sm font-medium border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/50 border-indigo-500/30 text-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 uppercase font-bold"
            >
              OK
            </button>
          </div>
        )}

        {/* Live Class Widget */}
        <div className="no-print">
          <LiveClassWidget turmaData={currentTurmaData} />
        </div>

        {/* Setup Grid: PDF Upload + Turma Selection */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <PdfUploader
              onFileLoaded={handleFileLoaded}
              onExtractText={handleExtractText}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
              selectedTurma={selectedTurma}
              loadedFileName={loadedFile?.name}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <TurmaSelector
              selectedTurma={selectedTurma}
              onSelectTurma={handleSelectTurma}
              detectedTurmas={detectedTurmas}
            />

            {/* Main Action Button (reproducing st.button("Extrair Meu Horário")) */}
            <div className="bg-slate-850 border border-slate-750 rounded-xl p-5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Ações Rápidas</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Gere os dados formatados para sincronizar com seu aplicativo escolar.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (loadedFile) {
                      extractFromCurrentPdf(loadedFile, selectedTurma);
                    } else {
                      handleLoadSample(selectedTurma);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Extrair Meu Horário (Turma {selectedTurma})</span>
                </button>

                {currentTurmaData && (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Baixar em JSON / Calendário</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Display Section */}
        {currentTurmaData && (
          <div className="space-y-4">
            {/* Header for print */}
            <div className="hidden print:block text-black p-4 text-center border-b border-black">
              <h1 className="text-2xl font-bold">Grade Horária — Turma {currentTurmaData.turma}</h1>
              <p className="text-sm text-gray-600">Extrator de Horário Escolar Urânia</p>
            </div>

            <TimetableGrid
              turmaData={currentTurmaData}
              onEditCell={(horario, dia, currentCell) =>
                setEditingCell({ horario, dia, cell: currentCell })
              }
            />
          </div>
        )}
      </main>

        {/* Modals */}
        {currentTurmaData && (
          <ExportModal
            turmaData={currentTurmaData}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onPrint={handlePrint}
          />
        )}

        <SiglasManagerModal
          isOpen={isSiglasModalOpen}
          onClose={() => setIsSiglasModalOpen(false)}
          siglas={siglas}
          onSaveSiglas={handleSaveSiglas}
        />

        <CellEditorModal
          isOpen={!!editingCell}
          onClose={() => setEditingCell(null)}
          horario={editingCell?.horario || ''}
          dia={editingCell?.dia || 'Segunda'}
          currentCell={editingCell?.cell || null}
          onSave={handleCellEditSave}
          knownSubjects={Object.values(siglas).filter((v, i, a) => a.indexOf(v) === i)}
        />
    </div>
  );
}
export default App;
