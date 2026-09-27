import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Brain,
  Compass,
  Briefcase,
  Users,
  Target,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const CareerDnaPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingDna, setExistingDna] = useState<any>(null);
  const [isRetaking, setIsRetaking] = useState(false);

  // Question data from backend
  const [questionsData, setQuestionsData] = useState<any>(null);

  // Assessment Step: 1. Interests -> 2. Aptitude Scenarios -> 3. Work Style -> 4. Aspirations & Preferences
  const [step, setStep] = useState(1);

  // Assessment Responses
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['technology', 'problem_solving']);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, string>>({});
  const [workStyle, setWorkStyle] = useState({
    autonomy: 'small_team',
    structurePreference: 'semi_structured',
    riskTolerance: 'balanced',
    problemSolvingStyle: 'Structured & Analytical'
  });
  const [aspirations, setAspirations] = useState({
    primaryLaunchGoal: 'placement',
    incomeVsStability: 'high_growth',
    timeHorizon: '6-12 Months'
  });
  const [workPreferences, setWorkPreferences] = useState({
    computerUse: 'High',
    handsOn: 'Moderate',
    outdoorField: 'Low',
    peopleInteraction: 'Moderate',
    environment: 'Hybrid / Office'
  });

  useEffect(() => {
    loadDnaAndQuestions();
  }, []);

  const loadDnaAndQuestions = async () => {
    setLoading(true);
    try {
      const [dnaRes, qRes] = await Promise.all([
        api.getCareerDna(),
        api.getCareerDnaQuestions()
      ]);

      if (dnaRes.hasDna && dnaRes.dna) {
        setExistingDna(dnaRes.dna);
      }
      if (qRes) {
        setQuestionsData(qRes);
      }
    } catch (err) {
      console.error('Failed to load Career DNA context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSelectAptitude = (questionId: string, optionId: string) => {
    setAptitudeAnswers({ ...aptitudeAnswers, [questionId]: optionId });
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      const payload = {
        interests: selectedInterests,
        aptitudeAnswers,
        workStyle,
        aspirations,
        workPreferences
      };

      const res = await api.evaluateCareerDna(payload);
      if (res.dna) {
        setExistingDna(res.dna);
        setIsRetaking(false);
        navigate('/3p-analysis');
      }
    } catch (err) {
      console.error('Error submitting Career DNA assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading AI Career DNA Assessment engine..." subtext="Calibrating multi-dimensional assessment matrix" />
      </div>
    );
  }

  // If user already has a saved Career DNA profile and is not currently re-taking
  if (existingDna && !isRetaking) {
    const threeP = existingDna.threeP || {};
    const aptitude = existingDna.aptitude || {};

    return (
      <div className="space-y-6">
        <JourneyStepper />

        {/* Existing Career DNA Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                  <Dna className="w-8 h-8 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                      Assessed & Verified
                    </span>
                    <span className="text-xs text-indigo-200">
                      Evaluated on {new Date(existingDna.updatedAt || existingDna.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white mt-1">Your AI Career DNA Profile</h1>
                  <p className="text-xs text-indigo-200 max-w-xl mt-1">
                    Multi-dimensional evidence synthesized across Interests, Aptitude Indicators, Work Style, and 3P Factors.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsRetaking(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>

                <button
                  onClick={() => navigate('/3p-analysis')}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>View 3P Analysis (Stage 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Overview Grid */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Executive Synthesis */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-indigo-950">Career DNA Assessment Summary</h3>
                <p className="text-xs text-indigo-900/80 leading-relaxed mt-1">
                  {existingDna.summaryNarrative || 'Candidate exhibits balanced problem-solving and structured collaboration traits.'}
                </p>
              </div>
            </div>

            {/* Core Dimensions Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Interests */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Natural Interest Areas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(existingDna.interests || []).map((int: string) => (
                    <span key={int} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium capitalize">
                      {int.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Aptitude Indicator */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                    <Brain className="w-4 h-4" />
                    <span>Aptitude Indicator</span>
                  </div>
                  <span className="text-xs font-black text-emerald-700">
                    {aptitude.overallIndicatorScore || 80}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Demonstrated solid competency in scenario-based problem solving and logical pattern recognition.
                </p>
                <span className="text-[10px] text-slate-400 block italic">
                  *Assessed as cognitive preference indicator, not fixed diagnosis.
                </span>
              </div>

              {/* 3. Work Style */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>Operating Style</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><strong className="text-slate-900">Autonomy:</strong> {existingDna.workStyle?.autonomy || 'Collaborative'}</p>
                  <p><strong className="text-slate-900">Structure:</strong> {existingDna.workStyle?.structurePreference || 'Semi-Structured'}</p>
                  <p><strong className="text-slate-900">Risk Profile:</strong> {existingDna.workStyle?.riskTolerance || 'Balanced'}</p>
                </div>
              </div>
            </div>

            {/* 3P Analysis Summary Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold tracking-tight">3P Analysis Synthesis (Process • Purpose • People)</h3>
                </div>
                <button
                  onClick={() => navigate('/3p-analysis')}
                  className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Full 3P Deep-Dive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">PROCESS (How You Work)</span>
                  <p className="text-sm font-bold text-white mt-1">{threeP.process?.primary || 'Analytical Execution'}</p>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{threeP.process?.evidence}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">PURPOSE (What Motivates You)</span>
                  <p className="text-sm font-bold text-white mt-1">{threeP.purpose?.primary || 'High Growth & Impact'}</p>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{threeP.purpose?.evidence}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-violet-300 tracking-wider block">PEOPLE (How You Interact)</span>
                  <p className="text-sm font-bold text-white mt-1">{threeP.people?.primary || 'Small Team Collaboration'}</p>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{threeP.people?.evidence}</p>
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Ready for Stage 3 & 4?</p>
                <p className="text-xs text-slate-500">Explore career pathways benchmarked directly against your Career DNA.</p>
              </div>
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <span>Proceed to Career Exploration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-Step Interactive Assessment Flow
  const totalSteps = 4;
  const aptitudeQs = questionsData?.aptitudeQuestions || [];
  const interestCats = questionsData?.interestCategories || [];
  const workStyleDims = questionsData?.workStyleDimensions || [];
  const aspirationDims = questionsData?.aspirationDimensions || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <JourneyStepper />

      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Stage 2 Assessment
              </span>
              <span className="text-xs text-slate-500">
                Step {step} of {totalSteps}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              AI Career DNA Assessment
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating multi-dimensional evidence across Interests, Aptitude Indicators, Work Style, and 3P Factors.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-indigo-600">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Interests Assessment */}
        {step === 1 && (
          <div className="py-6 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>1. Natural Interest Areas & Activity Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the activities and disciplines that naturally stimulate your curiosity. (Select at least 2)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {interestCats.map((cat: any) => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleInterest(cat.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Aptitude Indicator Scenarios */}
        {step === 2 && (
          <div className="py-6 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>2. Scenario-Based Aptitude & Problem Solving Indicators</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Short objective scenarios evaluating logical deduction, numerical reasoning, trade-offs, and practical troubleshooting.
              </p>
            </div>

            <div className="space-y-6">
              {aptitudeQs.map((q: any, qIdx: number) => (
                <div key={q.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Scenario {qIdx + 1}: {q.category}
                    </span>
                    <span className="text-xs text-slate-400">Trait: {q.trait.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {q.prompt}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt: any) => {
                      const isChosen = aptitudeAnswers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectAptitude(q.id, opt.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                            isChosen
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isChosen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.id.toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Personality & Practical Work Style */}
        {step === 3 && (
          <div className="py-6 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>3. Personality & Practical Work Style Dimensions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Beyond simplistic introvert/extrovert labels: measure operational autonomy, structure, and risk tolerance.
              </p>
            </div>

            <div className="space-y-6">
              {workStyleDims.map((dim: any) => (
                <div key={dim.id} className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    {dim.title}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {dim.options.map((opt: any) => {
                      const isSelected = (workStyle as any)[dim.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setWorkStyle({ ...workStyle, [dim.id]: opt.id })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block mb-1">{opt.label}</span>
                          <span className="text-[11px] text-slate-500 leading-snug block">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Career Aspirations & 3P Factors */}
        {step === 4 && (
          <div className="py-6 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>4. Career Aspirations & 3P Calibration (Process • Purpose • People)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define your primary launch pathway and working preferences to synthesize your complete 3P Profile.
              </p>
            </div>

            <div className="space-y-6">
              {aspirationDims.map((dim: any) => (
                <div key={dim.id} className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    {dim.title}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dim.options.map((opt: any) => {
                      const isSelected = (aspirations as any)[dim.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAspirations({ ...aspirations, [dim.id]: opt.id })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block mb-1">{opt.label}</span>
                          <span className="text-[11px] text-slate-500 leading-snug block">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Work Preference Sliders / Selectors */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900">Work Environment Preferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">Computer / Screen Work</span>
                    <select
                      value={workPreferences.computerUse}
                      onChange={(e) => setWorkPreferences({ ...workPreferences, computerUse: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="High">High (Majority Desk/Code)</option>
                      <option value="Moderate">Moderate (Blended)</option>
                      <option value="Low">Low (Prefer Physical)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">Hands-on / Practical</span>
                    <select
                      value={workPreferences.handsOn}
                      onChange={(e) => setWorkPreferences({ ...workPreferences, handsOn: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="High">High (Tools, Lab, Machinery)</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low (Screen-First)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">People / Client Interaction</span>
                    <select
                      value={workPreferences.peopleInteraction}
                      onChange={(e) => setWorkPreferences({ ...workPreferences, peopleInteraction: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="High">High (Stakeholders/Clients)</option>
                      <option value="Moderate">Moderate (Team Internal)</option>
                      <option value="Low">Low (Focused Solo Work)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Stage
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              Continue to Step {step + 1}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitAssessment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Dna className="w-4 h-4" />
              {submitting ? 'Synthesizing Career DNA...' : 'Generate Career DNA & 3P Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
