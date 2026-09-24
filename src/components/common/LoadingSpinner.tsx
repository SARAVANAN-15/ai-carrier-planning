import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  messages?: string[];
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'AI is processing...',
  messages = [
    'Analyzing your profile & background...',
    'Evaluating career fit & transferable strengths...',
    'Identifying critical skill gaps & practical requirements...',
    'Synthesizing personalized next actions...'
  ],
  subtext = 'Career Solver Engine is synthesizing realistic structured guidance'
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 animate-pulse-slow">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-800 transition-all duration-300">
        {messages[msgIndex] || label}
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        {subtext}
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mt-4">
        {messages.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === msgIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
