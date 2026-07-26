import React from 'react';
import { Upload, Sparkles, BookOpen } from 'lucide-react';

interface CtaSectionProps {
  onOpenUpload: () => void;
  onTrySample: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenUpload, onTrySample }) => {
  return (
    <section className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto my-8">
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-blue-950/80 border border-indigo-500/30 backdrop-blur-2xl text-center flex flex-col items-center">
        {/* Decorative Ambient Radial */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
          Ready to study 3x faster for your upcoming exam?
        </h2>

        <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
          Join thousands of university students saving hours every week. Upload your lecture PDF and receive your complete study kit right now.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenUpload}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF Lecture</span>
          </button>

          <button
            onClick={onTrySample}
            className="px-8 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Explore CS 301 Sample</span>
          </button>
        </div>
      </div>
    </section>
  );
};
