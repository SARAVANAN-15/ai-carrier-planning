import React, { useState, useEffect } from 'react';
import { GitCompare, Sparkles, Check, Clock, ShieldCheck, Briefcase, Plus, X } from 'lucide-react';
import { api } from '../services/api';

export const ComparePage: React.FC = () => {
  const [selectedCareers, setSelectedCareers] = useState<string[]>([
    'Java Backend Developer',
    'QA Automation Engineer',
    'Data Analyst'
  ]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const availableOptions = [
    'Java Backend Developer',
    'QA Automation Engineer',
    'Data Analyst',
    'Certified Electrical & Appliance Technician',
    'Digital Marketing & Growth Specialist'
  ];

  useEffect(() => {
    fetchComparisons();
  }, [selectedCareers]);

  const fetchComparisons = async () => {
    setLoading(true);
    try {
      const res = await api.comparePathways(selectedCareers);
      setComparisons(res.comparisons || []);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCareer = (career: string) => {
    if (selectedCareers.includes(career)) {
      if (selectedCareers.length > 1) {
        setSelectedCareers(selectedCareers.filter((c) => c !== career));
      }
    } else {
      if (selectedCareers.length < 3) {
        setSelectedCareers([...selectedCareers, career]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Career Pathway Comparison</h1>
            <p className="text-xs text-slate-500">
              Evaluate tradeoffs objectively across required skills, effort, entry barriers, and practical proof of work.
            </p>
          </div>
        </div>

        {/* Career selection chips */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Select up to 3 pathways to compare:</span>
          {availableOptions.map((opt) => {
            const isSelected = selectedCareers.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleToggleCareer(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt}
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedCareers.map((careerTitle, idx) => {
          const data = comparisons[idx] || {};

          return (
            <div key={careerTitle} className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                {/* Header card */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Pathway {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{careerTitle}</h3>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                    {data.category || 'Professional Track'}
                  </span>
                </div>

                {/* Body details */}
                <div className="p-6 space-y-4 text-xs">
                  {/* Preparation Effort */}
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Preparation Time
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{data.learningEffortMonths || '3 - 6 Months'}</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Key Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(data.requiredSkills || []).map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Transferable Skills */}
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Transferable Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(data.transferableSkills || []).map((ts: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                          {ts}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Entry Barrier */}
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Entry Barrier & Evaluation
                    </span>
                    <p className="text-slate-700 font-medium">{data.entryBarrier}</p>
                  </div>

                  {/* Practical Task Example */}
                  <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block mb-1">
                      Practical Task Example
                    </span>
                    <p className="text-slate-800 font-medium">{data.practicalTaskExample}</p>
                  </div>

                  {/* Portfolio Need */}
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Portfolio / Proof of Work Needed
                    </span>
                    <p className="text-slate-700">{data.portfolioNeed}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
