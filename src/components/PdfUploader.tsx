import React, { useState, useRef } from 'react';
import { extractTextFromPdf } from '../lib/pdf';
import { analyzeNotesWithGemini, createDefaultAnalysis } from '../lib/gemini';
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
  FileSpreadsheet,
  Layers,
  HelpCircle,
  Calendar,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Sliders
} from 'lucide-react';

interface PdfUploaderProps {
  onAnalysisComplete: (record: NoteRecord, targetTab?: 'summary' | 'topics' | 'flashcards' | 'quiz' | 'plan' | 'simple') => void;
  onCancel?: () => void;
  onExtractAndOpenChat?: (pdfText: string, title: string) => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onAnalysisComplete, onCancel, onExtractAndOpenChat }) => {
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
  
  // Extracted text preview
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedPageCount, setExtractedPageCount] = useState<number>(0);
  const [showPreviewText, setShowPreviewText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isExtractingOnly, setIsExtractingOnly] = useState(false);

  // User choice for which study outputs to generate
  const [selectedFormats, setSelectedFormats] = useState<{
    summary: boolean;
    quiz: boolean;
    flashcards: boolean;
    plan: boolean;
    simple: boolean;
  }>({
    summary: true,
    quiz: true,
    flashcards: true,
    plan: true,
    simple: true,
  });

  // User choice for item quantities
  const [quizCount, setQuizCount] = useState<number>(5);
  const [flashcardCount, setFlashcardCount] = useState<number>(5);

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

  // Dedicated function: Extract PDF text with PDF.js & Save Note Record so it shows in My Notes
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
      const title = lectureTitle || result.title || selectedFile.name.replace(/\.pdf$/i, '');
      if (!lectureTitle) {
        setLectureTitle(title);
      }

      // Guarantee the note is saved into My Notes history immediately
      const newRecord: NoteRecord = {
        id: 'note-' + Date.now(),
        userId: user?.uid || 'demo-user-101',
        title,
        pdfTextSnippet: result.text.slice(0, 300) + '...',
        analysis: createDefaultAnalysis(title, result.text),
        createdAt: new Date().toISOString(),
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        pageCount: result.pageCount,
      };

      await saveNoteToFirestore(newRecord);

      if (onExtractAndOpenChat) {
        onExtractAndOpenChat(result.text, title);
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

  const handleAnalyze = async (targetFormat?: 'summary' | 'topics' | 'flashcards' | 'quiz' | 'plan' | 'simple') => {
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
    setLoadingStep('Phase 2/3: Generating AI study conversions with Gemini 3.6 Flash...');

    try {
      let analysisData: NoteAnalysis;
      try {
        analysisData = await analyzeNotesWithGemini(textToAnalyze, title, { quizCount, flashcardCount });
      } catch (gemErr) {
        console.warn('Gemini analysis fallback active:', gemErr);
        analysisData = createDefaultAnalysis(title, textToAnalyze, { quizCount, flashcardCount });
      }

      setProgressPercent(90);
      setLoadingStep('Phase 3/3: Formatting study kit & saving to My Notes...');

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

      let resolvedTab: 'summary' | 'topics' | 'flashcards' | 'quiz' | 'plan' | 'simple' = targetFormat || 'summary';
      if (!targetFormat) {
        if (selectedFormats.quiz && !selectedFormats.summary) resolvedTab = 'quiz';
        else if (selectedFormats.flashcards && !selectedFormats.summary && !selectedFormats.quiz) resolvedTab = 'flashcards';
        else if (selectedFormats.plan && !selectedFormats.summary && !selectedFormats.quiz && !selectedFormats.flashcards) resolvedTab = 'plan';
        else if (selectedFormats.simple && !selectedFormats.summary && !selectedFormats.quiz && !selectedFormats.flashcards && !selectedFormats.plan) resolvedTab = 'simple';
      }

      onAnalysisComplete(newRecord, resolvedTab);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Failed to convert lecture notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-slate-100 relative max-h-[88vh] overflow-y-auto my-auto">
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

      {/* Conversion Formats Selector Section */}
      {!loading && (
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Choose What To Convert Your Note Into:
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select your preferred study output(s) or pick a target format below
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const allSelected = Object.values(selectedFormats).every(Boolean);
                setSelectedFormats({
                  summary: !allSelected,
                  quiz: !allSelected,
                  flashcards: !allSelected,
                  plan: !allSelected,
                  simple: !allSelected,
                });
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {Object.values(selectedFormats).every(Boolean) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {/* Format 1: Summary */}
            <div
              onClick={() => setSelectedFormats((prev) => ({ ...prev, summary: !prev.summary }))}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFormats.summary
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500/50 ring-1 ring-indigo-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">⚡ Smart Summary</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Bullet takeaways & topic breakdown</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedFormats.summary}
                onChange={() => {}}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Format 2: Quiz */}
            <div
              onClick={() => setSelectedFormats((prev) => ({ ...prev, quiz: !prev.quiz }))}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFormats.quiz
                  ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500/50 ring-1 ring-purple-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">❓ Interactive Quiz</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Multiple choice questions & score</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedFormats.quiz}
                onChange={() => {}}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Format 3: Flashcards */}
            <div
              onClick={() => setSelectedFormats((prev) => ({ ...prev, flashcards: !prev.flashcards }))}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFormats.flashcards
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">🃏 3D AI Flashcards</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Interactive 3D flip card deck</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedFormats.flashcards}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Format 4: Study Plan */}
            <div
              onClick={() => setSelectedFormats((prev) => ({ ...prev, plan: !prev.plan }))}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFormats.plan
                  ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">📅 7-Day Study Plan</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Daily milestones & schedule</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedFormats.plan}
                onChange={() => {}}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Format 5: Simple Explanation */}
            <div
              onClick={() => setSelectedFormats((prev) => ({ ...prev, simple: !prev.simple }))}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedFormats.simple
                  ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">💡 Plain Explanation</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Simple English conceptual breakdown</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedFormats.simple}
                onChange={() => {}}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Quantity Controls for Quiz Questions & Flashcards */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-500/20 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Customize Item Quantities</span>
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                Gemini 3.6 Flash
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quiz Question Count Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500" /> Quiz Questions
                  </span>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">{quizCount} Questions</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[3, 5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuizCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        quizCount === num
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 ring-2 ring-purple-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-purple-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={quizCount}
                    onChange={(e) => setQuizCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                    className="w-12 py-1 px-1 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    title="Custom question count"
                  />
                </div>
              </div>

              {/* Flashcard Count Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" /> Flashcards
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{flashcardCount} Cards</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[3, 5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFlashcardCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        flashcardCount === num
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-emerald-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={flashcardCount}
                    onChange={(e) => setFlashcardCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                    className="w-12 py-1 px-1 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    title="Custom flashcard count"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Direct Conversion Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Or convert immediately to:</span>
            <button
              type="button"
              onClick={() => handleAnalyze('quiz')}
              disabled={loading || (activeMode === 'pdf' && !selectedFile) || (activeMode === 'text' && !pastedText.trim())}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Convert to Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyze('flashcards')}
              disabled={loading || (activeMode === 'pdf' && !selectedFile) || (activeMode === 'text' && !pastedText.trim())}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Convert to 3D Cards</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyze('summary')}
              disabled={loading || (activeMode === 'pdf' && !selectedFile) || (activeMode === 'text' && !pastedText.trim())}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Convert to Summary</span>
            </button>
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
        /* Action Buttons */
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {activeMode === 'pdf' && (
            <button
              type="button"
              onClick={async () => {
                if (!extractedText) {
                  await handleExtractTextOnly();
                } else if (onExtractAndOpenChat) {
                  onExtractAndOpenChat(extractedText, lectureTitle || selectedFile?.name.replace(/\.pdf$/i, '') || 'Uploaded Note');
                }
              }}
              disabled={!selectedFile || isExtractingOnly}
              className="w-full sm:flex-1 py-3 px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${isExtractingOnly ? 'animate-spin' : ''}`} />
              <span>{isExtractingOnly ? 'Extracting Text...' : 'Extract Text & Ask AI Questions'}</span>
            </button>
          )}

          {(() => {
            const selectedCount = Object.values(selectedFormats).filter(Boolean).length;
            const canSubmit = (activeMode === 'pdf' ? !!selectedFile : !!pastedText.trim()) && selectedCount > 0;

            return (
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={!canSubmit || loading}
                className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {selectedCount === 0
                    ? 'Select at least 1 output format above'
                    : `Convert File (${selectedCount} Output${selectedCount > 1 ? 's' : ''} Selected)`}
                </span>
              </button>
            );
          })()}
        </div>
      )}

    </div>
  );

};
