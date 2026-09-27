import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  Sparkles,
  Check,
  Clock,
  ShieldCheck,
  Briefcase,
  Plus,
  X,
  ArrowRight,
  TrendingUp,
  Laptop,
  Wrench,
  Users,
  CheckCircle2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, activeGoal, refreshUser } = useAuth();

  const urlCareers = searchParams.get('careers')?.split(',').filter(Boolean);

  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [selectedCareers, setSelectedCareers] = useState<string[]>(
    urlCareers && urlCareers.length >= 2
      ? urlCareers.slice(0, 4)
      : ['Data Analyst', 'Licensed Electrician', 'Digital Growth Marketer']
  );
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load all available careers from catalog
  useEffect(() => {
    loadCatalog();
  }, []);

  // Fetch comparison whenever selectedCareers changes
  useEffect(() => {
    if (selectedCareers.length >= 2) {
      fetchComparison();
    }
  }, [selectedCareers]);

  const loadCatalog = async () => {
    try {
      const res = await api.getCareers();
      setAllCareers(res.careers || []);
    } catch (err) {
      console.error('Failed to load career catalog:', err);
    }
  };

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareCareersList(selectedCareers);
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCareer = (careerName: string) => {
    if (selectedCareers.includes(careerName)) {
      if (selectedCareers.length > 2) {
        setSelectedCareers(selectedCareers.filter((c) => c !== careerName));
      } else {
        setNotification('Please keep at least 2 careers for a side-by-side comparison.');
        setTimeout(() => setNotification(null), 4000);
      }
    } else {
      if (selectedCareers.length < 4) {
        setSelectedCareers([...selectedCareers, careerName]);
      } else {
        setNotification('You can compare a maximum of 4 pathways simultaneously.');
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  const handleSelectCareer = async (careerName: string) => {
    setIsActivating(careerName);
    try {
      await api.selectCareerPathway({ careerName });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      await refreshUser();
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to activate pathway:', err);
      setNotification('Failed to select career pathway.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsActivating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {notification && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900 shadow-sm flex items-center justify-between animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Career Pathway Comparison (Section 16)</h1>
            <p className="text-xs text-slate-500">
              Objective decision support comparing required skills, work styles, learning curves, entry barriers, and trade-offs.
            </p>
          </div>
        </div>

        {/* Dynamic Career Selection Chips */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">
            Select 2 to 4 pathways to compare side-by-side:
          </span>
          <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto pr-1">
            {allCareers.map((c) => {
              const isSelected = selectedCareers.includes(c.career_name);
              return (
                <button
                  key={c.id}
                  onClick={() => handleToggleCareer(c.career_name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.career_name}</span>
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decision Takeaways Banner */}
      {comparisonResult?.decisionTakeaways && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 space-y-2 text-xs text-indigo-950">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Decision Support Takeaways:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            {comparisonResult.decisionTakeaways.map((note: string, idx: number) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner label="Evaluating side-by-side comparison matrix..." subtext="Analyzing skill gaps, work environments, and trade-offs" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonResult?.careers?.map((c: any, idx: number) => {
            const isCurrentActive = activeGoal?.target_pathway === c.careerName || activeGoal?.title === c.careerName;

            return (
              <div
                key={c.id || c.careerName}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/40 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {c.category}
                      </span>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-700 px-2 py-0.5 rounded bg-white shadow-xs border border-indigo-100">
                          {c.overallScore}% Alignment
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 pt-1">
                      {c.careerName}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Dimension Metrics */}
                  <div className="p-6 space-y-4 text-xs">
                    {/* Work Environment */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Work Environment
                      </span>
                      <p className="text-slate-800 font-medium">
                        {c.workEnvironment || 'Standard professional environment'}
                      </p>
                    </div>

                    {/* Operational Styles */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hands-on</span>
                        <strong className="text-slate-800 text-[11px] font-bold">{c.handsOnLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Computer</span>
                        <strong className="text-slate-800 text-[11px] font-bold">{c.computerUseLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">People Interaction</span>
                        <strong className="text-slate-800 text-[11px] font-bold">{c.peopleInteractionLevel}</strong>
                      </div>
                    </div>

                    {/* Key Skills */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Core Skills Required
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {c.keySkillsRequired?.map((s: string) => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* User Skill Gaps */}
                    {c.userSkillGaps?.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">
                          Critical Gaps to Bridge
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {c.userSkillGaps.map((s: string) => (
                            <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Duration & Income */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Typical Duration</span>
                        <strong className="text-slate-800 font-semibold">{c.learningDuration}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Income Potential</span>
                        <strong className="text-indigo-600 font-semibold">{c.incomePotential}</strong>
                      </div>
                    </div>

                    {/* Trade-off Note */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/50 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Trade-off & Reality</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {c.tradeOffs}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/reality-check?career=${encodeURIComponent(c.careerName)}`)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Reality Check
                  </button>

                  <button
                    onClick={() => handleSelectCareer(c.careerName)}
                    disabled={isActivating === c.careerName || isCurrentActive}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isCurrentActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isActivating === c.careerName ? (
                      <span>Activating...</span>
                    ) : isCurrentActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Goal</span>
                      </>
                    ) : (
                      <>
                        <span>Select Pathway</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
