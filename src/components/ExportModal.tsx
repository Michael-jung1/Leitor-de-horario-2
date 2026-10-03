import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Calendar, Table, Printer } from 'lucide-react';
import { ExtractedTurmaData } from '../types';
import { generateCsv, generateIcs } from '../utils/parser';

interface ExportModalProps {
  turmaData: ExtractedTurmaData;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  turmaData,
  isOpen,
  onClose,
  onPrint
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'ics' | 'csv'>('json');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(turmaData.formattedRows, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_turma_${turmaData.turma}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIcs = () => {
    const icsContent = generateIcs(turmaData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_turma_${turmaData.turma}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvContent = generateCsv(turmaData.formattedRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_turma_${turmaData.turma}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-750 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportar Horário — Turma {turmaData.turma}</h3>
              <p className="text-xs text-slate-400">Compatível com o App Principal, Google Calendar e Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-5 pt-4 border-b border-slate-750 flex space-x-2">
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>JSON (App Principal)</span>
          </button>
          <button
            onClick={() => setActiveTab('ics')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'ics'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>iCalendar (.ics)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>CSV / Excel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {activeTab === 'json' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Arquivo JSON padrão esperado pelo aplicativo <span className="text-indigo-300 font-mono">app-escola-phi</span>:
              </p>
              <div className="relative">
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 max-h-60 overflow-y-auto">
                  {jsonString}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ics' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-indigo-200">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5 text-indigo-300">
                  <Calendar className="w-4 h-4" /> Calendário Semanal Automático
                </h4>
                <p>
                  O arquivo <strong>.ics</strong> cria eventos recorrentes semanais para todas as aulas com matérias e nomes dos professores no Google Agenda, Apple Calendar ou Outlook.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Exporta todas as linhas e colunas de horários formatadas em CSV compatível com Microsoft Excel, Google Planilhas e LibreOffice Calc.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-900/80 border-t border-slate-750 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Versão para Impressão</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            {activeTab === 'json' && (
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar em JSON para o App</span>
              </button>
            )}
            {activeTab === 'ics' && (
              <button
                onClick={handleDownloadIcs}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Calendário (.ics)</span>
              </button>
            )}
            {activeTab === 'csv' && (
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Tabela (.csv)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
