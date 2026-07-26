import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';

interface StudyPlanViewProps {
  studyPlan: string[];
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ studyPlan }) => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  if (!studyPlan || studyPlan.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No study plan generated for this lecture yet.
      </div>
    );
  }

  const toggleDay = (index: number) => {
    if (completedDays.includes(index)) {
      setCompletedDays(completedDays.filter((i) => i !== index));
    } else {
      setCompletedDays([...completedDays, index]);
    }
  };

  const progressPercent = Math.round((completedDays.length / studyPlan.length) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plan Header */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">7-Day Study Roadmap</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized day-by-day exam preparation schedule
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyPlan.map((dayText, idx) => {
          const isDone = completedDays.includes(idx);
          // Format day text (e.g. "Day 1: Review foundational definitions...")
          const dayTitle = `Day ${idx + 1}`;
          const content = dayText.replace(/^Day\s*\d+\s*:\s*/i, '');

          return (
            <div
              key={idx}
              onClick={() => toggleDay(idx)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm dark:shadow-none'
              }`}
            >
              <button className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {dayTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~45 mins
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isDone ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {content || dayText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

};
