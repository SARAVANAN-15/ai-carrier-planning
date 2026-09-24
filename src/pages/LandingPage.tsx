import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Map,
  CheckSquare,
  Bot,
  Mic2,
  Trophy,
  Users,
  Building2,
  Award,
  CheckCircle2,
  ChevronRight,
  Wrench,
  GraduationCap,
  Briefcase,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoPersona } = useAuth();

  const handleStart = () => {
    navigate('/onboarding');
  };

  const handleDemoClick = async (persona: 'arun' | 'muthu' | 'priya') => {
    await switchDemoPersona(persona);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              Career<span className="text-indigo-600">Solver</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#personas" className="hover:text-indigo-600 transition-colors">Who It Is For</a>
            <a href="#modules" className="hover:text-indigo-600 transition-colors">Core Features</a>
            <a href="#safety" className="hover:text-indigo-600 transition-colors">Trust & Safety</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-6 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Personal Growth, Career Reality Check & Mentorship Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
            Turn your career uncertainty into a <span className="gradient-text">practical path forward.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Career Solver does not just tell you what to become. It understands who you are, conducts an honest AI Reality Check, maps your skill gaps, and gives you actionable tasks you can actually do today.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Start Your Career Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm transition-all"
            >
              Explore Demo Personas
            </button>
          </div>

          {/* Quick 1-Click Persona Launch for Evaluators */}
          <div className="mt-12 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-soft max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              ⚡ Instant 1-Click Demo Evaluation (Select any Persona)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleDemoClick('arun')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Arun"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">Arun (College)</p>
                  <p className="text-[10px] text-slate-500 truncate">Java Backend Placement</p>
                </div>
              </button>

              <button
                onClick={() => handleDemoClick('muthu')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="Muthu"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">Muthu (Trades)</p>
                  <p className="text-[10px] text-slate-500 truncate">Electrical & Appliance</p>
                </div>
              </button>

              <button
                onClick={() => handleDemoClick('priya')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                  alt="Priya"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">Priya (Switcher)</p>
                  <p className="text-[10px] text-slate-500 truncate">Digital Marketing</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The 7-Step Journey */}
      <section id="how-it-works" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            The Coherent Experience
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            From "I don't know what to do" to "I know my next step"
          </h2>
          <p className="text-slate-600 text-sm mt-2 max-w-2xl mx-auto">
            Not a simple chatbot or static website. A connected system that moves you through every stage of growth.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'Understand', desc: 'Adaptive onboarding & strength discovery', icon: Sparkles },
            { step: '02', title: 'Reality Check', desc: 'AI fit analysis & skill gap diagnosis', icon: ShieldCheck },
            { step: '03', title: 'Plan', desc: '5-phase personalized learning roadmap', icon: Map },
            { step: '04', title: 'Learn by Doing', desc: 'Actionable daily tasks with AI feedback', icon: CheckSquare },
            { step: '05', title: 'Practice', desc: 'Interview & communication studio', icon: Mic2 },
            { step: '06', title: 'Connect', desc: 'Mentors, guilds & sample opportunities', icon: Users },
            { step: '07', title: 'Passport', desc: 'Verified living record of real growth', icon: Award },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between interactive-card">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-indigo-500">{item.step}</span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Personas Supported */}
      <section id="personas" className="py-16 px-6 bg-slate-100/70 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Inclusive Design
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Built for diverse, real-world pathways
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
              We do not assume that lack of a formal degree means absence of valuable skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">College Students</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Become placement-ready with structured skill gap analysis, code sprints, STAR resume tasks, and mock technical interview rounds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Practical & Trades Learners</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Respectful pathways for electrical, appliance repair, welding, and mechanics. Prioritizes Live-Dead-Live safety protocols and recognized apprenticeships.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Working Professionals</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Switch careers safely. Uncover your transferable customer, analytical, or managerial skills and fill specific domain gaps without starting from zero.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Entrepreneurs & Builders</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Transform raw ideas into customer problem statements, lean 7-day MVPs, and practical validation tasks with realistic unit economics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section id="safety" className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-indigo-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <ShieldCheck className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Committed to Realistic, Honest Guidance</h3>
            <p className="text-indigo-200 text-sm mt-3 leading-relaxed max-w-2xl mx-auto">
              Career Solver does not promise guaranteed jobs, instant wealth, or official government certifications. We provide structured AI reality checks, safe learning pathways, and clear distinctions between user-reported information and verified achievements.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-semibold text-indigo-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Non-Dogmatic AI Analysis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Practical Workshop Safety</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent Demo Content</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Career Solver AI — Personal Growth, Career Guidance, Mentorship & Opportunity Platform.</p>
        <p className="mt-1">All demo profiles and organizations are clearly marked for simulation and evaluation.</p>
      </footer>
    </div>
  );
};
