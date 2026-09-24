import React, { useState, useEffect } from 'react';
import {
  Mic2,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const PracticePage: React.FC = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [tab, setTab] = useState<'practice' | 'history'>('practice');

  useEffect(() => {
    fetchPrompts();
    fetchHistory();
  }, []);

  const fetchPrompts = async () => {
    try {
      const data = await api.getPracticePrompts();
      setPrompts(data.prompts || []);
      if (data.prompts && data.prompts.length > 0) {
        setSelectedPrompt(data.prompts[0]);
      }
    } catch (err) {
      console.warn('Failed to load practice prompts:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.getPracticeHistory();
      setHistory(data.sessions || []);
    } catch (err) {
      console.warn('Failed to load practice history:', err);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedPrompt || !userResponse.trim()) return;

    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await api.evaluatePractice({
        practiceType: selectedPrompt.type,
        mode: selectedPrompt.mode,
        promptQuestion: selectedPrompt.question,
        userResponse
      });

      setEvaluationResult(res.evaluation);
      await fetchHistory();

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Practice evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Practice Studio</h1>
            <p className="text-xs text-slate-500">
              Mock interview rounds, 60-second introductions, and trade safety explanations with objective AI coaching.
            </p>
          </div>
        </div>

        {/* Practice vs History Toggle */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab('practice')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              tab === 'practice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Practice Studio
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              tab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {tab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prompts list */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Select Practice Scenario
            </span>
            {prompts.map((p) => {
              const isSelected = selectedPrompt?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPrompt(p);
                    setEvaluationResult(null);
                    setUserResponse('');
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {p.scenario}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold capitalize">
                      {p.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                </button>
              );
            })}
          </div>

          {/* Interactive Workspace & Evaluation */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPrompt && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
                {/* Scenario details */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                    Prompt / Interview Question:
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    "{selectedPrompt.question}"
                  </p>
                  {selectedPrompt.sampleStructure && (
                    <p className="text-xs text-indigo-700 mt-2">
                      <strong>Recommended Structure:</strong> {selectedPrompt.sampleStructure}
                    </p>
                  )}
                </div>

                {/* User Response Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Your Response
                  </label>
                  <textarea
                    rows={6}
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type or dictate your answer here. Use the STAR method (Situation, Task, Action, Result) for best evaluation..."
                    className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Aim for clear, structured answers with real examples.</span>
                    <span>{userResponse.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserResponse('');
                      setEvaluationResult(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    disabled={evaluating || !userResponse.trim()}
                    onClick={handleEvaluate}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{evaluating ? 'Analyzing Delivery...' : 'Submit for AI Feedback'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Results Card */}
            {evaluationResult && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Objective Assessment
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">Coaching Evaluation</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Overall Rating</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {evaluationResult.scores?.overall || 80}/100
                    </span>
                  </div>
                </div>

                {/* 4 Score Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Clarity', score: evaluationResult.scores?.clarity },
                    { label: 'Relevance', score: evaluationResult.scores?.relevance },
                    { label: 'Structure', score: evaluationResult.scores?.structure },
                    { label: 'Completeness', score: evaluationResult.scores?.completeness },
                  ].map((dim, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {dim.label}
                      </span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">
                        {dim.score}%
                      </span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Structured Feedback Paragraphs */}
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-900 block mb-0.5 font-bold">Summary Observation:</strong>
                    <p className="leading-relaxed">{evaluationResult.feedback?.summary}</p>
                  </div>

                  {evaluationResult.feedback?.areasToImprove && (
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900">
                      <strong className="block mb-1 font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Key Opportunities for Improvement:
                      </strong>
                      <ul className="space-y-1 list-disc list-inside">
                        {evaluationResult.feedback.areasToImprove.map((tip: string, tIdx: number) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluationResult.improvedSampleResponse && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
                      <strong className="block mb-1 font-bold text-indigo-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        Polished Model Example:
                      </strong>
                      <p className="leading-relaxed text-indigo-900/90 font-medium">
                        "{evaluationResult.improvedSampleResponse}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
              <p className="text-sm font-semibold text-slate-700">No practice sessions completed yet.</p>
            </div>
          ) : (
            history.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {s.practice_type} • {s.mode}
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    Score: {s.scores?.overall || 82}%
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">"{s.prompt_question}"</p>
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 italic">
                  "{s.user_response}"
                </div>
                <p className="text-xs text-slate-600">{s.feedback?.summary}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
