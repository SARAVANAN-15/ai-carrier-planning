import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Users, Calendar, ArrowRight, Award, Zap, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getChallenges();
      setChallenges(data.challenges || []);
      if (data.challenges && data.challenges.length > 0) {
        setSelectedChallenge(data.challenges[0]);
      }
    } catch (err) {
      console.warn('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId: string) => {
    try {
      await api.joinChallenge(challengeId);
      await fetchChallenges();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
  };

  const handleCheckDay = async (challengeId: string, dayNumber: number) => {
    try {
      const res = await api.checkChallengeDay(challengeId, dayNumber);
      await fetchChallenges();

      confetti({
        particleCount: res.isCompleted ? 120 : 50,
        spread: res.isCompleted ? 80 : 50,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Failed to check challenge day:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Module 12 — Challenge-Based Community
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          7-Day Structured Growth Sprints
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl leading-relaxed">
          Growth happens through focused consistency. Join structured daily sprints, complete hands-on prompts alongside peers, and earn verifiable badges.
        </p>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => {
          const isSelected = selectedChallenge?.id === c.id;
          const isJoined = c.isJoined;
          const progressPct = Math.round(((c.completedDays?.length || 0) / c.duration_days) * 100);

          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-card ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-soft'
              }`}
              onClick={() => setSelectedChallenge(c)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {c.category} • {c.duration_days} Days
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {c.participants_count} joined
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>

              {/* Progress or Join Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                {isJoined ? (
                  <div className="w-full">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>{c.completedDays?.length || 0} of {c.duration_days} Days Done</span>
                      <span className="text-indigo-600 font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(c.id);
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Join This 7-Day Sprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Challenge Day-by-Day Checklist */}
      {selectedChallenge && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Active Sprint Tracker
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedChallenge.title}</h2>
            </div>

            {!selectedChallenge.isJoined && (
              <button
                onClick={() => handleJoin(selectedChallenge.id)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
              >
                Join Challenge to Track Progress
              </button>
            )}
          </div>

          {/* Daily Tasks List */}
          <div className="space-y-3 pt-2">
            {(selectedChallenge.dailyTasks || []).map((task: any) => {
              const isChecked = selectedChallenge.completedDays?.includes(task.day);

              return (
                <div
                  key={task.day}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-100'
                  }`}
                >
                  <button
                    type="button"
                    disabled={!selectedChallenge.isJoined}
                    onClick={() => handleCheckDay(selectedChallenge.id, task.day)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : selectedChallenge.isJoined
                        ? 'border-slate-300 hover:border-indigo-600 bg-white'
                        : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">Day {task.day}:</span>
                      <strong className={`font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </strong>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{task.prompt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
