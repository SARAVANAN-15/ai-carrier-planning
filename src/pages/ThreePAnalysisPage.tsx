import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Cpu,
  Target,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const ThreePAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [threePData, setThreePData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load3PAnalysis();
  }, []);

  const load3PAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getThreePAnalysis();
      if (res.threeP) {
        setThreePData(res);
      }
    } catch (err: any) {
      setError(err.message || 'No 3P Analysis found. Please complete the AI Career DNA assessment first.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Synthesizing 3P Analysis..." subtext="Extracting Process, Purpose, and People factors from your assessment" />
      </div>
    );
  }

  if (error || !threePData) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Career DNA Assessment Required</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          To generate an accurate 3P Profile (Process • Purpose • People), you must first complete the structured Stage 2 assessment.
        </p>
        <button
          onClick={() => navigate('/career-dna')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
        >
          <span>Start AI Career DNA Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { threeP, context } = threePData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <JourneyStepper />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                Stage 3 Analysis
              </span>
              <span className="text-xs text-indigo-200">
                Foundational Work Model
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              3P Analysis: Process • Purpose • People
            </h1>
            <p className="text-xs text-indigo-200/90 leading-relaxed mt-2">
              Discover how you work best, what intrinsically motivates your ambition, and your optimal collaboration dynamics. Grounded in your assessment responses.
            </p>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Proceed to Career Exploration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3P Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: PROCESS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              PILLAR 1: HOW YOU WORK
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">PROCESS</h3>
            <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs font-black text-blue-950 block">
                {threeP.process?.primary || 'Analytical & Structured'}
              </span>
              <span className="text-[11px] text-blue-800 font-medium block mt-0.5">
                Secondary: {threeP.process?.secondary || 'Technical Execution'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Assessment Evidence:</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {threeP.process?.evidence}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium block">
              Ideal role types: Technical, Diagnostic, Systematic
            </span>
          </div>
        </div>

        {/* Pillar 2: PURPOSE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              PILLAR 2: WHAT MOTIVATES YOU
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">PURPOSE</h3>
            <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-black text-emerald-950 block">
                {threeP.purpose?.primary || 'High Growth & Upside'}
              </span>
              <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                Secondary: {threeP.purpose?.secondary || 'Professional Mastery'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Assessment Evidence:</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {threeP.purpose?.evidence}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium block">
              Ideal incentives: High meritocracy, equity, mastery
            </span>
          </div>
        </div>

        {/* Pillar 3: PEOPLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
              PILLAR 3: HOW YOU INTERACT
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">PEOPLE</h3>
            <div className="mt-3 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
              <span className="text-xs font-black text-violet-950 block">
                {threeP.people?.primary || 'Small Team Collaboration'}
              </span>
              <span className="text-[11px] text-violet-800 font-medium block mt-0.5">
                Secondary: {threeP.people?.secondary || 'Peer Knowledge Exchange'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Assessment Evidence:</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {threeP.people?.evidence}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium block">
              Ideal team size: 3-8 peers with direct feedback
            </span>
          </div>
        </div>
      </div>

      {/* Psychological Disclaimer & Transparency */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <p className="font-bold">Transparent Assessment Framework</p>
          <p className="mt-0.5 text-amber-900/80">
            Career Solver does not claim that a single diagnostic provides a permanent psychological label. Your 3P Profile represents your current operating strengths and activity preferences, which evolve as you complete hands-on projects and gain industry experience.
          </p>
        </div>
      </div>

      {/* Next Step Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Next Stage: Career Awareness & Exploration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            View 29+ real-world careers across 10 industries filtered and ranked by your 3P compatibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/career-dna')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake DNA</span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>Explore Aligned Careers (Stage 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
