import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  GitCompare,
  Map,
  CheckSquare,
  Bot,
  Mic2,
  Trophy,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  Award,
  Settings,
  ShieldCheck,
  Dna,
  Scale,
  FolderGit2,
  Gauge,
  Rocket,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, activeGoal } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const coreJourneyItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { to: '/career-dna', label: 'Career DNA', icon: Dna, badge: 'Stage 2' },
    { to: '/3p-analysis', label: '3P Analysis', icon: Compass, badge: 'Stage 3' },
    { to: '/explore', label: 'Explore Careers', icon: Compass, badge: 'Stage 4' },
    { to: '/skill-gap', label: 'Skill Gap', icon: Scale, badge: 'Stage 5' },
    { to: '/roadmap', label: 'Learning Journey', icon: Map, badge: 'Stage 7' },
    { to: '/tasks', label: t('tasks'), icon: CheckSquare, badge: 'Daily' },
    { to: '/projects', label: 'Projects (PBL)', icon: FolderGit2, badge: 'Stage 9' },
    { to: '/industry-exposure', label: 'Industry Exposure', icon: Building2, badge: 'Stage 10' },
    { to: '/readiness', label: 'Readiness Score', icon: Gauge, badge: 'Stage 11' },
    { to: '/career-launch', label: 'Career Launch', icon: Rocket, badge: 'Stage 12' },
    { to: '/skill-passport', label: t('skillPassport'), icon: Award, badge: 'Stage 13' },
  ];

  const mentorshipItems = [
    { to: '/mentors', label: 'Expert Mentors', icon: UserCheck, badge: 'Human' },
    { to: '/mentor', label: 'AI Career Mentor', icon: Bot, badge: 'Gemini' },
  ];

  const enhancementItems = [
    { to: '/reality-check', label: t('realityCheck'), icon: ShieldCheck, badge: 'Reality' },
    { to: '/compare', label: t('compare'), icon: GitCompare, badge: null },
    { to: '/practice', label: t('practice'), icon: Mic2, badge: 'Drills' },
    { to: '/challenges', label: t('challenges'), icon: Trophy, badge: '7-Day' },
    { to: '/community', label: t('community'), icon: Users, badge: null },
    { to: '/business', label: t('businessBuilder'), icon: Briefcase, badge: 'MVP' },
    { to: '/organizations', label: t('organizations'), icon: Building2, badge: null },
  ];

  const systemItems = [
    { to: '/settings', label: t('settings'), icon: Settings, badge: null },
    { to: '/admin', label: 'Admin & Moderation', icon: ShieldCheck, badge: user?.role === 'admin' ? 'Admin' : null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Career<span className="text-indigo-600">Solver</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Discover • Develop • Deliver
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {/* Active Goal Highlight */}
          {activeGoal && (
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Target Career</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{activeGoal.title}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          {/* Core Company Journey */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Official Journey (1-13)
            </span>
            <div className="space-y-0.5">
              {coreJourneyItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Mentorship */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Mentorship Network
            </span>
            <div className="space-y-0.5">
              {mentorshipItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Additional Value Tools */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Decision & Practice Tools
            </span>
            <div className="space-y-0.5">
              {enhancementItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* System & Admin */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              System
            </span>
            <div className="space-y-0.5">
              {systemItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-indigo-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize truncate">
                  {profile?.persona_type?.replace(/_/g, ' ') || user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
