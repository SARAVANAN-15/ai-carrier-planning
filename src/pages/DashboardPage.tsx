import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  CheckSquare,
  Bot,
  Trophy,
  UserCheck,
  ShieldCheck,
  Award,
  Zap,
  Flame,
  ChevronRight,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickMentorInput, setQuickMentorInput] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.warn('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      await api.updateTaskStatus(taskId, newStatus);
      await fetchDashboard();

      if (newStatus === 'completed') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 animate-fade-in">
        Loading your personal growth dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Primary Goal Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 border border-white/20">
              Welcome back, {user?.name?.split(' ')[0]}
            </span>
            <span className="text-xs text-indigo-300 font-medium">
              Profile: {data.profileCompletion}% Complete
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {data.activeGoal}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200">
            Current Stage: <strong className="text-white">{data.currentPhase}</strong> • Target Pathway: {data.targetPathway}
          </p>

          {/* Quick Progress Bar */}
          <div className="mt-4 max-w-md">
            <div className="flex justify-between text-xs font-semibold text-indigo-200 mb-1">
              <span>Roadmap Completion</span>
              <span className="text-white font-bold">{data.roadmapProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${data.roadmapProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto relative z-10 shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Tasks Done</span>
            <span className="text-xl font-black text-white mt-0.5 block">{data.stats?.tasksCompleted || 0}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-300" />
              Streak
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{data.stats?.streakDays || 4} Days</span>
          </div>
        </div>
      </div>

      {/* 2. Prominent "NEXT BEST ACTION" Card */}
      {data.nextBestAction && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-indigo-50/50 p-6 rounded-3xl border border-emerald-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0 mt-0.5">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Recommended Priority
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{data.nextBestAction.title}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{data.nextBestAction.description}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(data.nextBestAction.link)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <span>{data.nextBestAction.buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks Checklist (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                  Today's Action Tasks
                </h2>
                <p className="text-xs text-slate-500">Concrete daily exercises to advance your roadmap</p>
              </div>

              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(data.todayTasks || []).map((task: any) => {
                const isDone = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/70 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-indigo-600 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {task.skill}
                          </span>
                          <span className="text-slate-400 font-medium">~{task.estimated_minutes} min</span>
                        </div>
                        <h4
                          className={`font-bold mt-1 text-slate-900 ${
                            isDone ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/tasks')}
                      className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                    >
                      Open
                    </button>
                  </div>
                );
              })}

              {(data.todayTasks || []).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  All daily tasks completed! Explore Practice Studio or Community challenges.
                </div>
              )}
            </div>
          </div>

          {/* Quick Ask AI Mentor Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Ask Your Persistent AI Mentor</h3>
            </div>
            <p className="text-xs text-slate-500">
              Need clarification on today's concept or career direction? Ask directly.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickMentorInput}
                onChange={(e) => setQuickMentorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickMentorInput.trim()) {
                    navigate('/mentor');
                  }
                }}
                placeholder="Ask advice on your current roadmap, debugging, or interview prep..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={() => navigate('/mentor')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Challenges, Mentors & Navigation (1 Col) */}
        <div className="space-y-6">
          {/* Active Challenge Card */}
          {data.activeChallenge && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Active Challenge
                </span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{data.activeChallenge.title}</h3>
              <p className="text-xs text-slate-500">
                Day {data.activeChallenge.progress_days} of {data.activeChallenge.duration_days} completed
              </p>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (data.activeChallenge.progress_days / data.activeChallenge.duration_days) * 100
                    )}%`
                  }}
                />
              </div>

              <button
                onClick={() => navigate('/challenges')}
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center block"
              >
                Continue Sprint
              </button>
            </div>
          )}

          {/* Quick Practice Studio Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-3xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Practice Studio</span>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Test your speaking clarity and STAR structure with simulated interview and practical questions.
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all text-center block"
            >
              Start Practice Session
            </button>
          </div>

          {/* Explore Mentorship & Opportunities Links */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-2 text-xs">
            <button
              onClick={() => navigate('/mentors')}
              className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Find Human Mentors
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/organizations')}
              className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Explore Opportunities
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
