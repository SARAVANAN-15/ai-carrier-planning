import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Lightbulb,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  DollarSign,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';

export const BusinessBuilderPage: React.FC = () => {
  const [ideaTitle, setIdeaTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [myIdeas, setMyIdeas] = useState<any[]>([]);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const data = await api.getMyBusinessIdeas();
      setMyIdeas(data.ideas || []);
      if (data.ideas && data.ideas.length > 0) {
        setActivePlan({
          ideaTitle: data.ideas[0].idea_title,
          problem: data.ideas[0].problem,
          targetUsers: data.ideas[0].target_users,
          existingAlternatives: data.ideas[0].existing_alternatives,
          proposedSolution: data.ideas[0].proposed_solution,
          valueProposition: data.ideas[0].value_proposition,
          mvpDescription: data.ideas[0].mvp_description,
          validationTasks: data.ideas[0].validationTasks,
          costPlanning: data.ideas[0].costPlanning
        });
      }
    } catch (err) {
      console.warn('Failed to load business ideas:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !rawDescription.trim()) return;

    setLoading(true);
    try {
      const res = await api.generateBusinessPlan({
        ideaTitle,
        rawDescription,
        targetAudience
      });
      setActivePlan(res.plan);
      await fetchIdeas();

      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Failed to generate business plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Business & Project Builder (Module 18)
            </h1>
            <p className="text-xs text-slate-500">
              Turn raw ideas into structured customer validation experiments and a 7-day minimum viable product (MVP).
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-6 pt-4 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business or Project Name
              </label>
              <input
                type="text"
                required
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="e.g. QuickFix Local Appliance Care / Campus Tutor Bot"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Customer Segment
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Apartment residents, local shops, college students"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              What Problem Does This Solve? (Describe your raw thought)
            </label>
            <textarea
              rows={3}
              required
              value={rawDescription}
              onChange={(e) => setRawDescription(e.target.value)}
              placeholder="e.g. Finding reliable appliance repair technicians who give transparent upfront prices is nearly impossible. Technicians often overcharge or take days to arrive..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Lean MVP...' : 'Generate Lean MVP Plan'}</span>
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <LoadingSpinner
            messages={[
              'Synthesizing customer problem statement...',
              'Analyzing existing market alternatives and pain points...',
              'Designing smallest 7-day MVP test...',
              'Formulating first 4 customer validation tasks...'
            ]}
          />
        </div>
      )}

      {/* Generated Lean Plan */}
      {!loading && activePlan && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Lean MVP Architecture
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{activePlan.ideaTitle}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                Action-Oriented Plan
              </span>
            </div>

            {/* Core Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  The Real Customer Pain
                </span>
                <p className="text-slate-900 leading-relaxed font-medium">{activePlan.problem}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Target Customer & Existing Alternatives
                </span>
                <p className="text-slate-900 font-semibold">{activePlan.targetUsers}</p>
                <p className="text-slate-500 mt-1">Currently using: {activePlan.existingAlternatives}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                  Proposed Solution
                </span>
                <p className="text-indigo-950 font-medium leading-relaxed">{activePlan.proposedSolution}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] block">
                  Unique Value Proposition
                </span>
                <p className="text-emerald-950 font-bold leading-relaxed">{activePlan.valueProposition}</p>
              </div>
            </div>

            {/* The 7-Day MVP */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-900 text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Smallest 7-Day MVP to Test Real Demand
              </span>
              <p className="text-sm font-semibold leading-relaxed text-indigo-100">
                {activePlan.mvpDescription}
              </p>
            </div>

            {/* First 4 Practical Validation Tasks */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                First 4 Practical Validation Tasks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(activePlan.validationTasks || []).map((task: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-level Cost Planning */}
            {activePlan.costPlanning && (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">
                  High-Level Cost Planning (Initial Estimate):
                </span>
                <p>• Initial Tools & Launch: {activePlan.costPlanning.initialToolsEstimate}</p>
                <p>• Monthly Operating Variable: {activePlan.costPlanning.monthlyOperating}</p>
                <p className="text-[10px] text-slate-400 italic mt-1">
                  {activePlan.costPlanning.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
