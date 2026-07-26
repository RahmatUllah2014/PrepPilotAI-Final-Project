import React, { useState, useRef } from 'react';
import { extractTextFromPdf } from '../lib/pdf';
import { analyzeNotesWithGemini } from '../lib/gemini';
import { saveNoteToFirestore } from '../lib/firestoreNotes';
import { useAuth } from '../context/AuthContext';
import { NoteRecord, NoteAnalysis } from '../types';
import { 
  Upload, 
  FileText, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FileType,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface PdfUploaderProps {
  onAnalysisComplete: (record: NoteRecord) => void;
  onCancel?: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onAnalysisComplete, onCancel }) => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'pdf' | 'text'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Progress & State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState('');
  
  // Extracted text preview for testing
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedPageCount, setExtractedPageCount] = useState<number>(0);
  const [showPreviewText, setShowPreviewText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isExtractingOnly, setIsExtractingOnly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError('');
    setExtractedText(null);
    setShowPreviewText(false);

    // 1. Check file extension & mime type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Invalid file type! Please upload a valid PDF document (.pdf).');
      setSelectedFile(null);
      return false;
    }

    // 2. Check file size limit (25 MB)
    const MAX_MB = 25;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the ${MAX_MB} MB limit.`);
      setSelectedFile(null);
      return false;
    }

    setSelectedFile(file);
    if (!lectureTitle) {
      setLectureTitle(file.name.replace(/\.pdf$/i, ''));
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Dedicated test function: Extract PDF text with PDF.js for testing
  const handleExtractTextOnly = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setError('');
    setIsExtractingOnly(true);
    setLoadingStep('Parsing PDF pages with PDF.js...');
    setProgressPercent(10);

    try {
      const result = await extractTextFromPdf(selectedFile, (current, total) => {
        const percent = Math.round((current / total) * 100);
        setProgressPercent(percent);
        setLoadingStep(`Extracting text with PDF.js: Page ${current} of ${total} (${percent}%)`);
      });

      setExtractedText(result.text);
      setExtractedPageCount(result.pageCount);
      setShowPreviewText(true);
      if (!lectureTitle) {
        setLectureTitle(result.title);
      }
    } catch (err: any) {
      console.error('Text Extraction Error:', err);
      setError(err?.message || 'Failed to extract text from PDF file.');
    } finally {
      setIsExtractingOnly(false);
      setProgressPercent(100);
    }
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    let textToAnalyze = extractedText || '';
    let title = lectureTitle.trim() || (selectedFile ? selectedFile.name.replace(/\.pdf$/i, '') : 'Untitled Lecture Note');
    let pageCount = extractedPageCount || 1;

    if (activeMode === 'pdf') {
      if (!selectedFile) {
        setError('Please select a PDF file first.');
        return;
      }

      if (!textToAnalyze) {
        setLoading(true);
        setLoadingStep('Phase 1/3: Parsing PDF pages with PDF.js...');
        setProgressPercent(15);

        try {
          const result = await extractTextFromPdf(selectedFile, (current, total) => {
            const pct = Math.round(15 + (current / total) * 35); // 15% to 50%
            setProgressPercent(pct);
            setLoadingStep(`Parsing PDF pages (${current}/${total} pages)`);
          });
          textToAnalyze = result.text;
          pageCount = result.pageCount;
          setExtractedText(result.text);
          setExtractedPageCount(result.pageCount);
          if (!lectureTitle) {
            title = result.title;
          }
        } catch (err: any) {
          console.error('PDF Extraction Error:', err);
          setError(err?.message || 'Failed to extract text from PDF. Ensure file is not encrypted or corrupt.');
          setLoading(false);
          return;
        }
      }
    } else {
      if (!pastedText.trim() || pastedText.trim().length < 30) {
        setError('Please enter at least 30 characters of lecture text.');
        return;
      }
      textToAnalyze = pastedText.trim();
      title = lectureTitle.trim() || 'Pasted Lecture Note';
      setLoading(true);
    }

    setLoading(true);
    setProgressPercent(60);
    setLoadingStep('Phase 2/3: Processing with Gemini 3.6 Flash AI...');

    try {
      const analysisData = await analyzeNotesWithGemini(textToAnalyze, title);

      setProgressPercent(90);
      setLoadingStep('Phase 3/3: Validating JSON & Formatting Study Kit...');

      const newRecord: NoteRecord = {
        id: 'note-' + Date.now(),
        userId: user?.uid || 'demo-user-101',
        title,
        pdfTextSnippet: textToAnalyze.slice(0, 300) + '...',
        analysis: analysisData,
        createdAt: new Date().toISOString(),
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Text input',
        pageCount,
      };

      // Save to Firestore & local storage
      await saveNoteToFirestore(newRecord);

      setProgressPercent(100);
      onAnalysisComplete(newRecord);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Failed to analyze lecture notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-slate-100 relative">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/25">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Lecture Notes</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports PDF slides, syllabus, chapter notes up to 25 MB
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-2xl mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveMode('pdf');
            setError('');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMode === 'pdf'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileType className="w-4 h-4" />
          <span>Upload PDF File</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('text');
            setError('');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMode === 'text'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Raw Text</span>
        </button>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Lecture Title / Course Name
        </label>
        <input
          type="text"
          value={lectureTitle}
          onChange={(e) => setLectureTitle(e.target.value)}
          placeholder="e.g. CS 301 - Operating Systems Chapter 4"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="leading-relaxed flex-1">{error}</span>
          <button 
            type="button"
            onClick={() => setError('')} 
            className="text-rose-600 dark:text-rose-400 hover:text-slate-900 dark:hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mode 1: PDF Dropzone & Controls */}
      {activeMode === 'pdf' ? (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-300 dark:border-white/15 hover:border-indigo-500/50 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-sm">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {extractedPageCount > 0 && <span>• {extractedPageCount} Pages Extracted</span>}
                  <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Click to change file</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Drag & Drop your lecture PDF here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  or click to browse files (PDF only, max 25 MB)
                </p>
              </div>
            )}
          </div>

          {/* PDF.js Extraction Test Action */}
          {selectedFile && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>PDF.js Text Extraction Test</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExtractTextOnly}
                  disabled={isExtractingOnly || loading}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30 transition-colors disabled:opacity-50"
                >
                  {isExtractingOnly ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>{extractedText ? 'Re-Extract Text' : 'Extract & Test Text'}</span>
                </button>
                {extractedText && (
                  <button
                    type="button"
                    onClick={() => setShowPreviewText(!showPreviewText)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {showPreviewText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreviewText ? 'Hide Text' : 'Inspect Text'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Temporary Extracted Text Display for Testing */}
          {showPreviewText && extractedText && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Extracted Text Preview ({extractedPageCount} pages, {extractedText.length} characters)
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Paste Raw Text */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paste Lecture Text
            </label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your lecture transcript, professor slides notes, or textbook chapter here..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono leading-relaxed resize-none"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-right">
              {pastedText.length} characters
            </p>
          </div>
        </div>
      )}

      {/* Progress & Loading Indicator State */}
      {loading ? (
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{loadingStep}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                PDF.js extraction & Gemini AI study kit synthesis...
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        /* Submit Button */
        <button
          type="button"
          onClick={handleAnalyze}
          className="mt-6 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Study Kit with Gemini AI</span>
        </button>
      )}
    </div>
  );

};
