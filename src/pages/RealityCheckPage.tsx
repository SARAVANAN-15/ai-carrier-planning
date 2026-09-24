import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  GitBranch,
  Calendar,
  Layers,
  Search,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RealityCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, activeGoal } = useAuth();

  const [targetCareer, setTargetCareer] = useState(activeGoal?.target_pathway || activeGoal?.title || 'Java Backend Developer');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getRealityCheckHistory();
      if (data.history && data.history.length > 0) {
        setHistory(data.history);
        setAssessment(data.history[0]);
      }
    } catch (err) {
      console.warn('Failed to load assessment history:', err);
    }
  };

  const handleRunCheck = async (careerToRun?: string) => {
    const career = careerToRun || targetCareer;
    if (!career.trim()) return;

    setLoading(true);
    try {
      const res = await api.runRealityCheck(career);
      setAssessment(res.result);
      await loadHistory();
    } catch (err) {
      console.error('Reality check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToRoadmap = async () => {
    if (!assessment) return;
    setConverting(true);
    try {
      await api.generateRoadmap({
        goalTitle: assessment.targetCareer || targetCareer,
        targetPathway: assessment.targetCareer || targetCareer,
        currentLevel: 'Intermediate'
      });
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to convert assessment to roadmap:', err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Module 2 — Career Reality Check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Objective, Nuanced Career Reality Check
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Honest AI evaluation of your profile against your target career. We identify existing transferable strengths, real-world skill gaps, and practical bottlenecks without false promises.
          </p>

          {/* Target Career Search Input */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="Enter or select target career (e.g. Java Backend, Electrical Technician, QA)"
                className="w-full pl-9 pr-3 py-3 rounded-2xl bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md"
              />
            </div>
            <button
              onClick={() => handleRunCheck()}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating...' : 'Run Reality Check'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-indigo-300 font-semibold">Popular Pathways:</span>
            {[
              'Java Backend Developer',
              'Certified Electrical & Appliance Technician',
              'Digital Marketing & Growth Specialist',
              'Data Analyst',
              'QA Automation Engineer'
            ].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setTargetCareer(p);
                  handleRunCheck(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-soft">
          <LoadingSpinner
            messages={[
              `Analyzing profile compatibility with ${targetCareer}...`,
              'Cross-referencing industry skill requirements & real-world tasks...',
              'Diagnosing transferable strengths and critical skill gaps...',
              'Synthesizing practical next steps and alternative pathways...'
            ]}
          />
        </div>
      )}

      {/* Assessment Output */}
      {!loading && assessment && (
        <div className="space-y-6 animate-fade-in">
          {/* Fit Overview & Convert Action */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Target Assessment
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {assessment.targetCareer}
                </span>
                {assessment.aiSource && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">
                    {assessment.aiSource}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed font-medium">
                {assessment.fitObservations}
              </p>
            </div>

            <button
              onClick={handleConvertToRoadmap}
              disabled={converting}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{converting ? 'Creating Roadmap...' : 'Convert to 5-Phase Roadmap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Two-Column Grid: Strengths vs Skill Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Strengths */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Existing Strengths</h3>
                  <p className="text-xs text-slate-500">Transferable skills from your current background</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {(assessment.strengths || []).map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Skill Gaps */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Missing Skill Gaps</h3>
                  <p className="text-xs text-slate-500">Priority areas to develop to reach placement/competency</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {(assessment.skillGaps || []).map((g: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Three-Column Grid: Requirements, Challenges, Recommended Prep */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-indigo-600">
                <ShieldCheck className="w-4 h-4" />
                Real-World Expectations
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {(assessment.requirements || []).map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
                Practical Challenges
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {(assessment.challenges || []).map((c: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 text-emerald-600">
                <Lightbulb className="w-4 h-4" />
                Preparation Priorities
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {(assessment.preparationAreas || []).map((p: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative Pathways & Immediate Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-violet-600" />
                Alternative Related Pathways
              </h3>
              <p className="text-xs text-slate-500 mb-4">Accessible adjacent careers that share your strengths</p>

              <div className="flex flex-wrap gap-2">
                {(assessment.alternativePathways || []).map((alt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTargetCareer(alt);
                      handleRunCheck(alt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-800 border border-violet-200 text-xs font-semibold hover:bg-violet-100 transition-colors flex items-center gap-1.5"
                  >
                    <span>{alt}</span>
                    <ArrowRight className="w-3 h-3 text-violet-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Immediate Next Steps (This Week)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Concrete actions you can start without waiting</p>

              <ul className="space-y-2 text-xs text-slate-700">
                {(assessment.immediateNextSteps || []).map((step: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 bg-indigo-50/40 p-2 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conclusion Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Reality Check Principle:</strong> {assessment.verdictSummary || 'Guidance is generated based on your profile inputs and current market patterns. Availability of local apprenticeships, licensing tests, or corporate hiring cycles should be verified with training providers or employers.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
