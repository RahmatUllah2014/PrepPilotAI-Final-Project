import React, { useState } from 'react';
import { Sparkles, Tag, BookOpen, Filter } from 'lucide-react';

interface TopicsViewProps {
  importantTopics: string[];
}

export const TopicsView: React.FC<TopicsViewProps> = ({ importantTopics }) => {
  const [selectedTopicIdx, setSelectedTopicIdx] = useState<number | null>(null);

  if (!importantTopics || importantTopics.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No important topics identified.
      </div>
    );
  }

  // Parse topics into title + description
  const parsedTopics = importantTopics.map((topicText, idx) => {
    const parts = topicText.split(':');
    const title = parts.length > 1 ? parts[0].trim() : `Topic ${idx + 1}`;
    const description = parts.length > 1 ? parts.slice(1).join(':').trim() : topicText;
    return { id: idx, title, description, raw: topicText };
  });

  const filteredTopics = selectedTopicIdx !== null 
    ? parsedTopics.filter(t => t.id === selectedTopicIdx)
    : parsedTopics;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Topics Badges Header Container */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Important Topics Badges</h3>
          </div>
          {selectedTopicIdx !== null && (
            <button
              onClick={() => setSelectedTopicIdx(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Show All ({importantTopics.length})
            </button>
          )}
        </div>

        {/* Display as Badges */}
        <div className="flex flex-wrap gap-2.5">
          {parsedTopics.map((topic) => {
            const isSelected = selectedTopicIdx === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicIdx(isSelected ? null : topic.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{topic.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-sm dark:shadow-none"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                  Badge #{topic.id + 1}
                </span>
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {topic.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {topic.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};
