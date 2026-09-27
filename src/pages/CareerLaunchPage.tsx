import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Layers,
  Compass,
  Check,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const CareerLaunchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [templates, setTemplates] = useState<any>({});
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<string>('placement');
  const [updatingMilestone, setUpdatingMilestone] = useState(false);

  useEffect(() => {
    loadLaunchData();
  }, []);

  const loadLaunchData = async () => {
    setLoading(true);
    try {
      const res = await api.getCareerLaunch();
      if (res) {
        setActivePlan(res.activePlan);
        setTemplates(res.availableTemplates || {});
        setActiveGoal(res.activeGoal || null);
        if (res.activePlan?.pathway_type) {
          setSelectedPathway(res.activePlan.pathway_type);
        }
      }
    } catch (err) {
      console.error('Failed to load career launch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = async (type: string) => {
    try {
      const res = await api.selectCareerLaunchPathway(type, activeGoal || undefined);
      if (res.plan) {
        setActivePlan(res.plan);
        setSelectedPathway(type);
      }
    } catch (err) {
      console.error('Error selecting launch pathway:', err);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentCompleted: boolean) => {
    setUpdatingMilestone(true);
    try {
      const res = await api.updateLaunchMilestone(milestoneId, !currentCompleted);
      if (res.success) {
        setActivePlan({
          ...activePlan,
          milestones: res.milestones,
          progress_pct: res.progressPct
        });
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
    } finally {
      setUpdatingMilestone(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading Career Launch Pipelines..." subtext="Configuring action templates for Placement, Higher Studies, Venture, and Freelancing" />
      </div>
    );
  }

  const pathways = [
    {
      id: 'placement',
      title: 'Corporate Placement',
      subtitle: 'Campus & Off-Campus Hiring',
      icon: Briefcase,
      color: 'indigo',
      desc: 'Targeted resume optimization, aptitude screening, technical drills, and structured hiring pipeline tracking.'
    },
    {
      id: 'higher_studies',
      title: 'Higher Studies & Research',
      subtitle: 'Masters, GATE, GRE & MBA',
      icon: GraduationCap,
      color: 'emerald',
      desc: 'Postgraduate entrance syllabus, academic statement of purpose (SOP), recommendation letters, and university selection.'
    },
    {
      id: 'entrepreneurship',
      title: 'Entrepreneurship & Startups',
      subtitle: 'Venture & Lean MVP Launch',
      icon: Layers,
      color: 'violet',
      desc: 'Problem validation, customer discovery interviews, lean canvas unit economics, rapid MVP building, and early traction.'
    },
    {
      id: 'freelancing',
      title: 'Independent Freelancing',
      subtitle: 'High-Ticket Services & Agency',
      icon: TrendingUp,
      color: 'amber',
      desc: 'Service offer packaging, proof-of-work case studies, client contracts, cold outreach, and retainer closing.'
    }
  ];

  const currentTemplate = templates[selectedPathway] || templates.placement;
  const currentMilestones = activePlan?.pathway_type === selectedPathway
    ? activePlan.milestones
    : currentTemplate?.milestones || [];

  const progress = activePlan?.pathway_type === selectedPathway ? (activePlan.progress_pct || 0) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <JourneyStepper />

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Stage 12 Final Milestone
              </span>
              <span className="text-xs text-slate-500">
                Placement & Execution Track
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Career Launch Pathway
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Choose your official launch trajectory. Whether securing a corporate placement, pursuing postgraduate research, or establishing a venture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/skill-passport')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>Skill Passport & Growth (Stage 13)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Pathway Option Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-6">
          {pathways.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPathway === p.id;
            const isActivated = activePlan?.pathway_type === p.id;

            return (
              <button
                key={p.id}
                onClick={() => handleSelectPathway(p.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {isActivated && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                        Active Track
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{p.title}</h3>
                  <p className="text-[10px] text-indigo-600 font-semibold mb-1">{p.subtitle}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pathway Detail & Interactive Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {currentTemplate?.title || 'Placement Track'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTemplate?.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 block">
                {progress}% Completed
              </span>
              <span className="text-[10px] text-slate-400">Launch Pipeline</span>
            </div>
            <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Step-by-Step Launch Checklist
          </h4>
          <div className="space-y-2.5">
            {currentMilestones.map((m: any, idx: number) => {
              const isDone = Boolean(m.completed);
              return (
                <div
                  key={m.id || idx}
                  onClick={() => handleToggleMilestone(m.id, isDone)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 text-slate-400 hover:border-indigo-600'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold block ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {m.step}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        Phase: {m.category || 'Preparation'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Freelance & Business Builder Cross-Link */}
        {selectedPathway === 'freelancing' || selectedPathway === 'entrepreneurship' ? (
          <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-100 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-violet-900">Dedicated Business Builder Tools Available</h5>
              <p className="text-[11px] text-violet-700 mt-0.5">
                Use our automated Lean Canvas generator, pricing calculators, and client proposal pitch creator.
              </p>
            </div>
            <button
              onClick={() => navigate('/business')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Launch Business Builder
            </button>
          </div>
        ) : null}

        {/* Footer CTAs */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Checking off launch milestones updates your global Career Readiness Index in real-time.
          </p>

          <button
            onClick={() => navigate('/skill-passport')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>Continuous Career Growth (Stage 13)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
