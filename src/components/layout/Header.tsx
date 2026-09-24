import React, { useState } from 'react';
import { Menu, Bell, Globe, ChevronDown, User, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, profile, logout, switchDemoPersona } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const personas = [
    {
      key: 'arun',
      name: 'Arun Kumar',
      role: 'College Student (Java Backend)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      key: 'muthu',
      name: 'Muthu Vel',
      role: 'Vocational / Practical (Electrical & Appliance)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      key: 'priya',
      name: 'Priya Sharma',
      role: 'Career Switcher (Digital Marketing)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
    }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs text-slate-400 font-medium">Platform /</span>
          <span className="ml-1 text-sm font-semibold text-slate-800">
            {profile?.target_goal || 'Career Solver'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1-Click Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPersonaMenu(!showPersonaMenu);
              setShowUserMenu(false);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-active" />
            <span className="hidden md:inline">Demo Persona:</span>
            <span className="font-bold">{user?.name?.split(' ')[0] || 'Demo'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-card border border-slate-100 p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Demo Persona
                </p>
                <p className="text-xs text-slate-500">
                  Switch instantly to explore different user journeys
                </p>
              </div>

              {personas.map((p) => {
                const isCurrent = user?.name?.includes(p.name);
                return (
                  <button
                    key={p.key}
                    onClick={async () => {
                      await switchDemoPersona(p.key as any);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/80 border border-indigo-200/60 text-indigo-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{p.name}</p>
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{p.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
          <button
            onClick={() => setLanguage('English')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              language === 'English'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('Tamil')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              language === 'Tamil'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowPersonaMenu(false);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card border border-slate-100 p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
                  2 New
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100/60">
                  <p className="text-xs font-semibold text-indigo-900">Today's Task Ready</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Your daily hands-on practice exercise is ready in the Tasks tab.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">Mentor Request Accepted</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Karthik Sundaram accepted your mentorship request.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowPersonaMenu(false);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-indigo-200"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card border border-slate-100 p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/skill-passport');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-400" />
                Skill Passport
              </button>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                API & Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  navigate('/auth');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
