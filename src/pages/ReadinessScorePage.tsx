import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gauge,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  MessageSquare,
  Brain,
  FolderGit2,
  Video,
  Award,
  ShieldCheck,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const ReadinessScorePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [readinessData, setReadinessData] = useState<any>(null);

  useEffect(() => {
    loadReadiness();
  }, []);

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const res = await api.getCareerReadiness();
      if (res) {
        setReadinessData(res);
      }
    } catch (err) {
      console.error('Failed to load career readiness score:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Calculating Multi-Dimensional Readiness Index..." subtext="Synthesizing task completions, proof-of-work deliverables, and interview drills" />
      </div>
    );
  }

  const overall = readinessData?.overallScore || 50;
  const breakdown = readinessData?.breakdown || {};
  const tips = readinessData?.actionableTips || [];
  const level = readinessData?.level || 'Advancing Candidate';

  const pillarIcons: Record<string, any> = {
    technical: Cpu,
    communication: MessageSquare,
    problemSolving: Brain,
    projectExperience: FolderGit2,
    interview: Video,
    professionalSkills: Award
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <JourneyStepper />

      {/* Hero Score Card */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                Stage 11 Evaluation
              </span>
              <span className="text-xs text-indigo-200">
                Automated Competency Index
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Career Readiness Score: {overall} / 100
            </h1>
            <p className="text-xs text-indigo-200/90 leading-relaxed mt-2">
              A composite benchmark measuring your industry hiring readiness across 6 key pillars. Dynamically recalculates as you complete roadmap tasks, project deliverables, and interview simulations.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/15 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Current Status: {level}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Visual Gauge Radial */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overall}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">{overall}%</span>
                <span className="text-[10px] text-indigo-200 block font-semibold uppercase">Readiness</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/career-launch')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>Activate Career Launch (Stage 12)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {Object.entries(breakdown).map(([key, item]: [string, any]) => {
          const Icon = pillarIcons[key] || Award;
          const score = item.score || 50;
          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Weight: {item.weight}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.label}</h3>
                <p className="text-xs text-slate-500 leading-snug mt-1">
                  {item.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Proficiency</span>
                  <span className="font-bold text-indigo-600">{score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Recommendations to Boost Score */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">
            Actionable Steps to Reach 85%+ Placement Readiness
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tips.map((tip: string, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Completing today’s roadmap tasks or submitting a project immediately updates your readiness metrics.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
            >
              Submit Project Deliverable
            </button>
            <button
              onClick={() => navigate('/career-launch')}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>Select Career Launch Pathway</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
