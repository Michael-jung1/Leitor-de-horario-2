import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, FileUp, Sparkles, Type } from 'lucide-react';

interface PdfUploaderProps {
  onFileLoaded: (file: File) => void;
  onExtractText: (text: string) => void;
  onLoadSample: (turma: string) => void;
  isLoading: boolean;
  selectedTurma: string;
  loadedFileName?: string;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onFileLoaded,
  onExtractText,
  onLoadSample,
  isLoading,
  selectedTurma,
  loadedFileName
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileLoaded(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-750 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload de PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'paste'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Colar Texto da Grade</span>
          </button>
        </div>

        {/* Quick Sample Button */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-400 hidden sm:inline">Exemplos:</span>
          <button
            onClick={() => onLoadSample('104')}
            className="px-2 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            104
          </button>
          <button
            onClick={() => onLoadSample('206')}
            className="px-2 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            206
          </button>
          <button
            onClick={() => onLoadSample('305')}
            className="px-2 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            305
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                : loadedFileName
                ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="py-4 flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                <p className="text-sm font-semibold text-slate-200">Analisando as grades do PDF com Urânia AI...</p>
                <p className="text-xs text-slate-400 mt-1">Mapeando matérias, professores e turmas</p>
              </div>
            ) : loadedFileName ? (
              <div className="py-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-emerald-300 truncate max-w-sm">{loadedFileName}</p>
                <p className="text-xs text-slate-400 mt-1">PDF carregado com sucesso. Clique para trocar de arquivo.</p>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Arraste e solte o seu PDF aqui</p>
                <p className="text-xs text-slate-400 mt-1">Compatível com relatórios de horários gerados pelo Urânia (PDF)</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Upload className="w-3 h-3" /> Selecionar arquivo no computador
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Cole aqui o texto copiado do PDF ou relatório de horários do Urânia..."
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex justify-end">
            <button
              onClick={() => onExtractText(pastedText)}
              disabled={!pastedText.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Processar Texto Colado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
