import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserCheck,
  Dna,
  Compass,
  Search,
  Scale,
  Sparkles,
  MapPin,
  Users,
  FolderGit2,
  Building2,
  Gauge,
  Rocket,
  Award,
  CheckCircle2
} from 'lucide-react';

export interface JourneyStep {
  id: string;
  number: number;
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { id: 'onboarding', number: 1, label: 'Onboarding', path: '/onboarding', icon: UserCheck, description: 'Basic student & academic profile' },
  { id: 'career-dna', number: 2, label: 'Career DNA', path: '/career-dna', icon: Dna, description: 'Interests, Aptitude & Work Style' },
  { id: '3p-analysis', number: 3, label: '3P Analysis', path: '/3p-analysis', icon: Compass, description: 'Process • Purpose • People' },
  { id: 'explore', number: 4, label: 'Explore Careers', path: '/explore', icon: Search, description: 'Industry awareness & catalog' },
  { id: 'skill-gap', number: 5, label: 'Skill Gap', path: '/skill-gap', icon: Scale, description: 'Current skills vs expected' },
  { id: 'recommendations', number: 6, label: 'Recommendations', path: '/explore', icon: Sparkles, description: 'Transparent alignment rankings' },
  { id: 'roadmap', number: 7, label: 'Learning Journey', path: '/roadmap', icon: MapPin, description: 'Personalized 5-phase roadmap' },
  { id: 'mentors', number: 8, label: 'Mentor Guidance', path: '/mentors', icon: Users, description: 'Human experts & AI Mentor' },
  { id: 'projects', number: 9, label: 'Projects (PBL)', path: '/projects', icon: FolderGit2, description: 'Real-world problem briefs' },
  { id: 'industry-exposure', number: 10, label: 'Industry Exposure', path: '/industry-exposure', icon: Building2, description: 'Internships, hackathons & events' },
  { id: 'readiness', number: 11, label: 'Readiness Score', path: '/readiness', icon: Gauge, description: 'Multi-dimensional readiness index' },
  { id: 'career-launch', number: 12, label: 'Career Launch', path: '/career-launch', icon: Rocket, description: 'Placement, Higher Studies, Venture, Freelance' },
  { id: 'growth', number: 13, label: 'Continuous Growth', path: '/skill-passport', icon: Award, description: 'Skill Passport & Habit Challenges' },
];

export const JourneyStepper: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine current active step index
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.path === currentPath);
  const activeStep = currentIndex >= 0 ? JOURNEY_STEPS[currentIndex] : JOURNEY_STEPS[0];

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              {activeStep.number}
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Stage {activeStep.number} of 13: {activeStep.label}
            </span>
          </div>
          <span className="text-xs text-indigo-600 font-semibold">
            {Math.round(((activeStep.number) / 13) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(((activeStep.number) / 13) * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide">
              Official Journey
            </span>
            <span>Career Solver 13-Stage Progression</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover. Develop. Deliver. Follow the sequential path to placement and readiness.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-indigo-600">
            Current Stage: {activeStep.number} / 13
          </span>
        </div>
      </div>

      {/* Horizontal scrollable stepper bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {JOURNEY_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentPath === step.path;
          const isPassed = step.number < activeStep.number;

          return (
            <Link
              key={step.id}
              to={step.path}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : isPassed
                  ? 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80 border border-indigo-100'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isPassed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
              </div>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{step.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
