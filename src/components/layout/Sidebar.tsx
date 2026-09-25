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
  ChevronRight,
  ShieldCheck,
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

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { to: '/reality-check', label: t('realityCheck'), icon: ShieldCheck, badge: 'Core' },
    { to: '/navigator', label: t('navigator'), icon: Compass, badge: 'AI' },
    { to: '/compare', label: t('compare'), icon: GitCompare, badge: null },
    { to: '/roadmap', label: t('roadmap'), icon: Map, badge: null },
    { to: '/tasks', label: t('tasks'), icon: CheckSquare, badge: 'Daily' },
    { to: '/mentor', label: t('mentor'), icon: Bot, badge: 'AI' },
    { to: '/practice', label: t('practice'), icon: Mic2, badge: 'Studio' },
    { to: '/challenges', label: t('challenges'), icon: Trophy, badge: '7-Day' },
    { to: '/community', label: t('community'), icon: Users, badge: null },
    { to: '/mentors', label: t('mentors'), icon: UserCheck, badge: 'Human' },
    { to: '/organizations', label: t('organizations'), icon: Building2, badge: 'Demo' },
    { to: '/business', label: t('businessBuilder'), icon: Briefcase, badge: 'MVP' },
    { to: '/skill-passport', label: t('skillPassport'), icon: Award, badge: 'Verified' },
    { to: '/settings', label: t('settings'), icon: Settings, badge: null },
    { to: '/admin', label: 'Admin & Moderation', icon: ShieldCheck, badge: user?.role === 'admin' ? 'Admin' : 'Portal' },
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
                AI Platform
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

        {/* Active Goal Snippet */}
        {activeGoal && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 rounded-xl border border-indigo-100/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Active Pathway
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 status-dot-active" />
            </div>
            <p className="text-xs font-medium text-slate-800 line-clamp-1">
              {activeGoal.title}
            </p>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Core'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.badge === 'AI'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-indigo-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 capitalize truncate">
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
