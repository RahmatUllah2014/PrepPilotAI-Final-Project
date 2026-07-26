import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Type, Sparkles } from 'lucide-react';

interface ExplanationViewProps {
  explanation: string;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({ explanation }) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  if (!explanation) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No simple explanation available.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm leading-relaxed';
      case 'base':
        return 'text-sm sm:text-base leading-relaxed';
      case 'lg':
        return 'text-base sm:text-lg leading-relaxed';
      case 'xl':
        return 'text-lg sm:text-xl leading-relaxed';
      default:
        return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Large Readable Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-slate-100 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-indigo-950/80 border border-amber-500/20 backdrop-blur-2xl shadow-xl dark:shadow-2xl space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Plain English / ELI5
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Simplified Explanation
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
              <Type className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5 mr-0.5" />
              {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    fontSize === sz
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sz === 'sm' ? 'S' : sz === 'base' ? 'M' : sz === 'lg' ? 'L' : 'XL'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-sm dark:shadow-none"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Card Content Body */}
        <div className={`p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal tracking-normal shadow-sm dark:shadow-none ${getFontSizeClass()}`}>
          {explanation}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Designed for quick, intuitive comprehension
          </span>
          <span>{explanation.length} characters</span>
        </div>
      </div>
    </div>
  );

};
