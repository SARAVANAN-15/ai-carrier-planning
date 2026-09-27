import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  MapPin,
  TrendingUp,
  Search,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const careerParam = searchParams.get('career');

  const [loading, setLoading] = useState(true);
  const [careersList, setCareersList] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>(careerParam || '');
  const [gapData, setGapData] = useState<any>(null);

  useEffect(() => {
    loadCareersAndGap();
  }, [selectedCareerId]);

  const loadCareersAndGap = async () => {
    setLoading(true);
    try {
      const [careersRes, gapRes] = await Promise.all([
        api.getCareers({}),
        api.getSkillGaps(selectedCareerId || undefined)
      ]);

      if (careersRes?.careers) {
        setCareersList(careersRes.careers);
      }
      if (gapRes?.analysis) {
        setGapData(gapRes.analysis);
        if (!selectedCareerId && gapRes.analysis.careerId) {
          setSelectedCareerId(gapRes.analysis.careerId);
        }
      }
    } catch (err) {
      console.error('Failed to load skill gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCareer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCareerId(e.target.value);
  };

  if (loading && !gapData) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Auditing Skill Competencies..." subtext="Comparing your current skill baseline against industry benchmark requirements" />
      </div>
    );
  }

  const comparisons = gapData?.skillsComparison || [];
  const strengths = gapData?.strengths || [];
  const criticalGaps = gapData?.criticalGaps || [];
  const priorityActions = gapData?.priorityActions || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <JourneyStepper />

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Stage 5 Analysis
              </span>
              <span className="text-xs text-slate-500">Competency Benchmarking</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Skill Gap Identification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct comparison between your current proficiencies and expected industry standards for your target pathway.
            </p>
          </div>

          {/* Career Selector Dropdown */}
          <div className="w-full sm:w-72">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Evaluating Target Pathway:
            </label>
            <div className="relative">
              <select
                value={selectedCareerId}
                onChange={handleSelectCareer}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm pr-8 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {careersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.career_name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* High-Level Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              CURRENT READINESS MATCH
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-600">
                {gapData?.readinessMatchPct || 65}%
              </span>
              <span className="text-xs text-slate-500">Benchmark Fit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Derived from verified and user-reported skill proficiencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              CONFIRMED STRENGTHS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">
                {strengths.length}
              </span>
              <span className="text-xs text-slate-500">Skills &gt; 70%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Transferable competencies that shorten your ramp-up time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              CRITICAL LEARNING GAPS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600">
                {criticalGaps.length}
              </span>
              <span className="text-xs text-slate-500">High Priority</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Competencies requiring focused study in Phase 1 & 2 of your roadmap.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Skill Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Detailed Skill Comparison Matrix: {gapData?.careerName}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {comparisons.length} Evaluated Competencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4 font-bold">Skill Competency</th>
                <th className="py-3 px-4 font-bold">Current Baseline</th>
                <th className="py-3 px-4 font-bold">Industry Benchmark</th>
                <th className="py-3 px-4 font-bold">Skill Gap</th>
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">Suggested Learning Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparisons.map((row: any, idx: number) => {
                const isHigh = row.priority === 'High';
                const isLow = row.priority === 'Low';
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.skill}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${row.currentLevel}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{row.currentLevel}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${row.targetLevel}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{row.targetLevel}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${isHigh ? 'text-amber-600' : isLow ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {row.gap > 0 ? `-${row.gap}%` : '0% (Met)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isLow
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {row.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] leading-snug">
                      {row.suggestedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Action Plan Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Immediate Skill Remediation Roadmap
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Automated learning plan mapping
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {priorityActions.map((act: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{act.skill}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Est. {act.estimatedWeeks}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {act.action}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            These priorities have been integrated directly into your personalized 5-phase learning roadmap.
          </p>

          <button
            onClick={() => navigate('/roadmap')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>Proceed to Learning Journey (Stage 7)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
