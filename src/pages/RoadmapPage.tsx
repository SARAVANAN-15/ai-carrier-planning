import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Calendar,
  CheckSquare,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeGoal } = useAuth();

  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.getActiveRoadmap();
      setRoadmap(res.roadmap);
      setTasks(res.tasks || []);
    } catch (err) {
      console.warn('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      await api.generateRoadmap({
        goalTitle: activeGoal?.title || 'Personalized Action Plan',
        targetPathway: activeGoal?.target_pathway || 'General Track',
        currentLevel: 'Intermediate'
      });
      await fetchRoadmap();
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-soft">
        <LoadingSpinner
          label="Synthesizing your 5-Phase Action Plan..."
          messages={[
            'Organizing phases from foundation to job readiness...',
            'Structuring balanced weekly study tasks...',
            'Calculating realistic milestones and checkpoints...'
          ]}
        />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Map className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Roadmap Generated Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
          Run your Career Reality Check first or generate an instant 5-Phase Action Plan for your active goal.
        </p>
        <button
          onClick={handleRegenerate}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate My 5-Phase Roadmap Now
        </button>
      </div>
    );
  }

  const phases = roadmap.phases || [];
  const weeklyPlan = roadmap.weeklyPlan || [];
  const milestones = roadmap.milestones || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Active Roadmap
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Level: {roadmap.current_level}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {roadmap.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Target Role: <strong className="text-slate-700">{roadmap.target_role}</strong> • 5 Sequential Mastery Phases
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Overall Progress</span>
            <span className="text-xl font-black text-indigo-600">{roadmap.progress_pct}%</span>
          </div>

          <button
            onClick={handleRegenerate}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Regenerate plan"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Plan</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500"
          style={{ width: `${roadmap.progress_pct}%` }}
        />
      </div>

      {/* 5 Sequential Phases */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          5-Phase Journey to Mastery
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {phases.map((phase: any, idx: number) => {
            const isCurrent = idx === roadmap.current_phase_index;
            const isPast = idx < roadmap.current_phase_index;

            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-indigo-500 shadow-card ring-2 ring-indigo-500/10'
                    : isPast
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200/80 shadow-soft opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : phase.phaseNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Phase {phase.phaseNumber}: {phase.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{phase.durationWeeks}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isCurrent
                        ? 'bg-indigo-100 text-indigo-800'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCurrent ? 'Current Focus' : isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4">{phase.description}</p>

                {/* Topics / Skills in this phase */}
                <div className="flex flex-wrap gap-2">
                  {(phase.topics || []).map((t: string, tIdx: number) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Plan & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Rhythm */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Weekly Learning Schedule
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Daily Rhythm</span>
          </div>

          <div className="space-y-2.5">
            {weeklyPlan.map((d: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs font-bold text-indigo-700">{d.day}</span>
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">{d.focus}</span>
                  <p className="text-slate-500 mt-0.5">{d.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Checkpoints */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Milestone Checkpoints
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Verification</span>
          </div>

          <div className="space-y-3">
            {milestones.map((m: any, idx: number) => {
              const isDone = m.status === 'completed';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.title}</p>
                      <p className="text-[10px] text-slate-400">{m.date || m.targetWeeks || 'Upcoming'}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? 'Done' : 'Target'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/tasks')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Go to Today's Tasks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
