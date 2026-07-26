import React, { useState } from 'react';
import { NoteRecord } from '../types';
import { SummaryView } from './SummaryView';
import { TopicsView } from './TopicsView';
import { FlashcardsView } from './FlashcardsView';
import { QuizView } from './QuizView';
import { StudyPlanView } from './StudyPlanView';
import { ExplanationView } from './ExplanationView';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Calendar, 
  Lightbulb, 
  Share2, 
  ArrowLeft,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  Code
} from 'lucide-react';

interface StudyKitViewerProps {
  note: NoteRecord;
  onBack: () => void;
}

export const StudyKitViewer: React.FC<StudyKitViewerProps> = ({ note, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'topics' | 'flashcards' | 'quiz' | 'plan' | 'simple' | 'json'>('summary');
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const { analysis } = note;

  const handleCopyReport = () => {
    const reportText = `PrepPilot AI Study Kit: ${note.title}\n\n=== SUMMARY ===\n${analysis.summary.join('\n')}\n\n=== SIMPLE EXPLANATION ===\n${analysis.simpleExplanation}\n\n=== 7-DAY STUDY PLAN ===\n${analysis.studyPlan.join('\n')}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_study_kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
            title="Back to Notes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                AI Study Kit
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {note.title}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-sm dark:shadow-none"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            <span>{copied ? 'Copied Report' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-8 text-xs font-semibold shadow-sm dark:shadow-none">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary ({analysis.summary.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'topics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Important Topics ({analysis.importantTopics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards ({analysis.flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz ({analysis.quiz.length} MCQs)</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'plan'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Study Plan (7 Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('simple')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'simple'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Simple Explanation</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'json'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Raw Gemini JSON</span>
        </button>
      </div>


      {/* Tab Content Display */}
      <div className="min-h-[400px]">
        {/* Tab 1: Summary */}
        {activeTab === 'summary' && (
          <SummaryView summary={analysis.summary} />
        )}

        {/* Tab 2: Important Topics */}
        {activeTab === 'topics' && (
          <TopicsView importantTopics={analysis.importantTopics} />
        )}

        {/* Tab 3: Flashcards */}
        {activeTab === 'flashcards' && (
          <FlashcardsView flashcards={analysis.flashcards} />
        )}

        {/* Tab 4: Quiz */}
        {activeTab === 'quiz' && (
          <QuizView quiz={analysis.quiz} />
        )}

        {/* Tab 5: Study Plan */}
        {activeTab === 'plan' && (
          <StudyPlanView studyPlan={analysis.studyPlan} />
        )}

        {/* Tab 6: Simple Explanation */}
        {activeTab === 'simple' && (
          <ExplanationView explanation={analysis.simpleExplanation} />
        )}

        {/* Tab 7: Raw Gemini JSON (For Testing & Inspection) */}
        {activeTab === 'json' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-indigo-500/30 font-mono text-xs text-slate-300 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white text-sm">Validated Gemini 3.6 Flash Response JSON</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  Schema Valid
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/30"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied JSON!' : 'Copy Raw JSON'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              This raw JSON object was generated by Gemini 3.6 Flash via server-side API, parsed with responseSchema, and strictly validated before rendering.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 max-h-96 overflow-y-auto text-[11px] text-indigo-200 leading-relaxed font-mono select-text whitespace-pre-wrap">
              {JSON.stringify(analysis, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
