import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 px-6 lg:px-12 py-6 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            © 2026 PrepPilot AI — Final University Project
          </span>
        </div>

        <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
          <a 
            href="/api/download-readme" 
            download="README.md"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300"
            title="Download full project README.md documentation"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download README.md</span>
          </a>
          <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">Gemini 3.6 Flash Integration</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Online • Gemini AI Active</span>
        </div>
      </div>
    </footer>

  );
};
