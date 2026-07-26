import React from 'react';
import { FileUp, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <FileUp className="w-6 h-6 text-indigo-400" />,
      title: 'Upload Lecture PDF',
      description: 'Drag & drop your lecture slides, professor notes, or textbook chapters. PDF.js extracts the raw text directly in your browser.'
    },
    {
      num: '02',
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: 'Gemini AI Processing',
      description: 'Gemini 3.6 Flash analyzes key concepts, extracts core definitions, formulates 10 MCQs, and creates a 7-day study roadmap.'
    },
    {
      num: '03',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: 'Study & Ace Exams',
      description: 'Review interactive 3D flashcards, take self-graded practice quizzes, follow your daily schedule, and master the material.'
    }
  ];

  return (
    <section className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How PrepPilot AI Works
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
          From raw lecture notes to a complete exam preparation kit in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="p-8 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl relative flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-sm dark:shadow-none"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-slate-300 dark:text-white/10 font-mono">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
            </div>

            {index < 2 && (
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>

  );
};
