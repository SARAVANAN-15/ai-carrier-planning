import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Wrench,
  Briefcase,
  Lightbulb,
  Clock,
  Compass,
  Laptop,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [personaType, setPersonaType] = useState('college_student');
  const [educationLevel, setEducationLevel] = useState('Undergraduate (B.Tech / B.E.)');
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science / Data Science');
  const [occupation, setOccupation] = useState('Student');
  const [targetGoal, setTargetGoal] = useState('Placement-ready for a Java Backend Developer role');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(['Basic Java', 'SQL Basics', 'HTML/CSS']);
  const [practicalSkills, setPracticalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>(['Problem Solving', 'Communication']);
  const [interests, setInterests] = useState<string[]>(['Technology', 'Engineering']);
  const [workPreference, setWorkPreference] = useState('computer_based');
  const [dailyLearningHours, setDailyLearningHours] = useState(2);
  const [budgetConstraint, setBudgetConstraint] = useState('moderate');
  const [hasComputer, setHasComputer] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [location, setLocation] = useState('Chennai, India');

  // Skill input tags
  const [techInput, setTechInput] = useState('');
  const [practicalInput, setPracticalInput] = useState('');

  const handleAddTechSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!technicalSkills.includes(techInput.trim())) {
        setTechnicalSkills([...technicalSkills, techInput.trim()]);
      }
      setTechInput('');
    }
  };

  const handleAddPracticalSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && practicalInput.trim()) {
      e.preventDefault();
      if (!practicalSkills.includes(practicalInput.trim())) {
        setPracticalSkills([...practicalSkills, practicalInput.trim()]);
      }
      setPracticalInput('');
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding({
        persona_type: personaType,
        education_level: educationLevel,
        field_of_study: fieldOfStudy,
        current_status: occupation,
        occupation,
        target_goal: targetGoal,
        experience_level: 'Intermediate',
        technical_skills: technicalSkills,
        practical_skills: practicalSkills,
        soft_skills: softSkills,
        interests,
        work_preference: workPreference,
        daily_learning_hours: dailyLearningHours,
        budget_constraint: budgetConstraint,
        has_computer: hasComputer,
        has_smartphone: true,
        preferred_language: preferredLanguage,
        location,
      });

      await refreshUser();
      navigate('/reality-check');
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 4: {step === 1 ? 'Your Persona' : step === 2 ? 'Existing Skills' : step === 3 ? 'Target Goal' : 'Preferences & Launch'}</span>
            <span>{Math.round((step / 4) * 100)}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-slate-200/80">
          {/* STEP 1: Persona & Background */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Which best describes your current journey?</h2>
                <p className="text-xs text-slate-500 mt-1">We tailor the roadmap and recommendations to your real-world background.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'college_student',
                    title: 'College Student',
                    desc: 'Pursuing degree, targeting placement & campus recruitment.',
                    icon: GraduationCap,
                    defGoal: 'Placement-ready for a Java Backend Developer role'
                  },
                  {
                    id: 'vocational_practical',
                    title: 'Practical Experience / Trades',
                    desc: 'Practical trade experience (electrical, repair, plumbing, crafting).',
                    icon: Wrench,
                    defGoal: 'Certified Electrical & Appliance Service Technician'
                  },
                  {
                    id: 'professional',
                    title: 'Working Professional',
                    desc: 'Looking to transition careers and leverage transferable skills.',
                    icon: Briefcase,
                    defGoal: 'Transition to Digital Marketing & Growth Specialist'
                  },
                  {
                    id: 'entrepreneur',
                    title: 'Aspiring Entrepreneur',
                    desc: 'Have an idea and want to validate customer pain and build an MVP.',
                    icon: Lightbulb,
                    defGoal: 'Launch an On-Demand Home Appliance Repair Service'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = personaType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPersonaType(item.id);
                        setTargetGoal(item.defGoal);
                        if (item.id === 'vocational_practical') {
                          setEducationLevel('Practical experience / Non-traditional educational background');
                          setFieldOfStudy('Vocational Trade (Electrical & Appliance Repair)');
                          setWorkPreference('hands_on');
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Education Background</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="e.g. Final Year B.Tech, Practical experience, etc."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Field / Trade Focus</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Data Science, Electrical Wiring, Literature"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills & Experience */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">What can you already do?</h2>
                <p className="text-xs text-slate-500 mt-1">We distinguish user-reported skills and identify what you can build upon.</p>
              </div>

              {personaType === 'vocational_practical' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Practical & Hands-On Skills (Type and press Enter)
                  </label>
                  <input
                    type="text"
                    value={practicalInput}
                    onChange={(e) => setPracticalInput(e.target.value)}
                    onKeyDown={handleAddPracticalSkill}
                    placeholder="e.g. Multimeter usage, Wiring installation, Soldering..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {practicalSkills.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                        {s}
                        <button onClick={() => setPracticalSkills(practicalSkills.filter(x => x !== s))} className="hover:text-amber-950 font-bold">×</button>
                      </span>
                    ))}
                    {practicalSkills.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setPracticalSkills(['Appliance Dismantling', 'Multimeter Testing', 'Soldering', 'Wiring Installation'])}
                        className="text-xs text-indigo-600 font-semibold underline"
                      >
                        + Add suggested trade skills
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Skills (Type and press Enter)
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTechSkill}
                    placeholder="e.g. Java, Python, SQL, Excel, Git..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
                        {s}
                        <button onClick={() => setTechnicalSkills(technicalSkills.filter(x => x !== s))} className="hover:text-indigo-950 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Interests & Domains</label>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'Skilled Trades', 'Business', 'Marketing', 'Healthcare', 'Engineering', 'Education', 'Agriculture', 'Creative'].map((cat) => {
                    const isSelected = interests.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isSelected) setInterests(interests.filter(x => x !== cat));
                          else setInterests([...interests, cat]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Target Goal */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">What are you working toward?</h2>
                <p className="text-xs text-slate-500 mt-1">Specify your target pathway or position. The AI will evaluate this in your Reality Check.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Primary Target Goal</label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Placement-ready for a Java Backend Developer role"
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Pathway Suggestions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Java Backend Placement Ready',
                    'Certified Electrical & Appliance Technician',
                    'Data Analyst & Business Intelligence',
                    'Digital Marketing & Growth Specialist',
                    'Quality Assurance & Automation Engineer',
                    'UI/UX Product Designer'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetGoal(preset)}
                      className={`p-3 text-left rounded-xl text-xs font-semibold border transition-all ${
                        targetGoal === preset
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preferences & Constraints */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Real-World Constraints & Preferences</h2>
                <p className="text-xs text-slate-500 mt-1">We tailor daily task durations so they fit your real daily schedule.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Available Learning Time: <span className="text-indigo-600 font-bold">{dailyLearningHours} Hours/Day</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={dailyLearningHours}
                    onChange={(e) => setDailyLearningHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 hour</span>
                    <span>3 hours</span>
                    <span>6+ hours</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Style Preference</label>
                  <select
                    value={workPreference}
                    onChange={(e) => setWorkPreference(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="computer_based">Computer-Based / Remote Friendly</option>
                    <option value="hands_on">Hands-On Physical / Trade Work</option>
                    <option value="mixed">Mixed (Office + Field)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language for Guidance</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, India"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Ready summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <p className="font-bold">Next: Career Reality Check</p>
                  <p className="mt-0.5">
                    Upon completing onboarding, Career Solver will run an AI fit analysis on your target career ({targetGoal}) and identify your transferable strengths and missing skills.
                  </p>
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
                Previous
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Launch Career Reality Check
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
