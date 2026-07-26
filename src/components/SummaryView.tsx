import React, { useState } from 'react';
import { FileText, Check, Copy, Sparkles, CheckCircle2 } from 'lucide-react';

interface SummaryViewProps {
  summary: string[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  const [copied, setCopied] = useState(false);

  if (!summary || summary.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No summary bullet points available.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.map((pt, i) => `${i + 1}. ${pt}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Core Lecture Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {summary.length} key takeaways synthesized by Gemini 3.6 Flash AI
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm dark:shadow-none"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          <span>{copied ? 'Copied Bullets!' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Bullet Points List */}
      <div className="space-y-3">
        {summary.map((point, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-start gap-4 group shadow-sm dark:shadow-none"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30 group-hover:scale-110 transition-transform">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {point}
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );

};
