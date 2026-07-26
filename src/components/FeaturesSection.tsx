import React from 'react';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Calendar, 
  Lightbulb, 
  Bookmark,
  Sparkles
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      title: 'Smart Summaries',
      description: 'Condense massive 100-page lecture slides and textbook chapters into actionable, high-yield takeaways in seconds.',
      color: 'from-indigo-500/10 to-indigo-500/0',
      border: 'hover:border-indigo-500/50'
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      title: '3D AI Flashcards',
      description: 'Instantly generate interactive, flippable study decks built for active recall, customized to your syllabus.',
      color: 'from-blue-500/10 to-blue-500/0',
      border: 'hover:border-blue-500/50'
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-emerald-400" />,
      title: '10-MCQ Practice Quizzes',
      description: 'Test your knowledge with 10 generated exam-style multiple-choice questions complete with instant feedback and scoring.',
      color: 'from-emerald-500/10 to-emerald-500/0',
      border: 'hover:border-emerald-500/50'
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      title: '7-Day Study Plans',
      description: 'Never wonder what to review next. Get a day-by-day structured roadmap broken down from Day 1 to Day 7.',
      color: 'from-purple-500/10 to-purple-500/0',
      border: 'hover:border-purple-500/50'
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
      title: 'Simple Explanations',
      description: 'Complex topics explained like you are 5. Break down dense university terminology into intuitive real-world analogies.',
      color: 'from-amber-500/10 to-amber-500/0',
      border: 'hover:border-amber-500/50'
    },
    {
      icon: <Bookmark className="w-6 h-6 text-sky-400" />,
      title: 'History & Cloud Sync',
      description: 'Revisit any analyzed lecture at any time. All study kits are saved to your account and synced across sessions.',
      color: 'from-sky-500/10 to-sky-500/0',
      border: 'hover:border-sky-500/50'
    },
  ];

  return (
    <section className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>All-In-One Study Engine</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything you need to prep for midterms & finals
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto">
          PrepPilot AI transforms static PDF lecture notes into multi-dimensional learning materials automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl transition-all duration-300 ${feature.border} hover:-translate-y-1 group relative overflow-hidden shadow-sm dark:shadow-none`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};
