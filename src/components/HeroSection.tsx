import React from 'react';
import { Upload, Sparkles, FileText, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenUpload: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenUpload }) => {
  return (
    <section className="relative z-10 pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center flex flex-col items-center">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-[400px] h-[250px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span>Powered by Gemini 3.6 Flash & PDF.js</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15] max-w-4xl">
        Turn your lecture notes into{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
          exam-ready study kits.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
        Upload your lecture PDFs and instantly receive AI-generated summaries, key concept breakdowns, 3D interactive flashcards, 10-MCQ quizzes, and personalized 7-day study plans.
      </p>

      {/* Primary Hero CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <button
          onClick={onOpenUpload}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group"
        >
          <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Upload PDF Lecture</span>
        </button>
      </div>

      {/* Key Stats Bar */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl p-4 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex flex-col items-center p-3 border-r border-slate-200 dark:border-white/5 last:border-0">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">30 sec</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Average Processing</span>
        </div>
        <div className="flex flex-col items-center p-3 border-r border-slate-200 dark:border-white/5 last:border-0">
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Structured JSON</span>
        </div>
        <div className="flex flex-col items-center p-3 border-r border-slate-200 dark:border-white/5 last:border-0">
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">10 MCQs</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Auto-Generated Quiz</span>
        </div>
        <div className="flex flex-col items-center p-3">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">7 Days</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Custom Study Plan</span>
        </div>
      </div>

    </section>
  );
};
