import React from 'react';
import { ShieldCheck, CheckCircle2, User, Zap } from 'lucide-react';

interface BadgeProps {
  type: 'verified' | 'completed_activity' | 'user_reported' | 'core' | 'demo' | 'info';
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, label, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (type) {
    case 'verified':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {label || 'Verified'}
        </span>
      );
    case 'completed_activity':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          {label || 'Completed Activity'}
        </span>
      );
    case 'user_reported':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <User className="w-3 h-3 text-amber-600 shrink-0" />
          {label || 'User Reported'}
        </span>
      );
    case 'demo':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          {label || 'Demo Listing'}
        </span>
      );
    case 'core':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-violet-50 text-violet-700 border border-violet-200 ${sizeClasses}`}>
          <Zap className="w-3 h-3 text-violet-600 shrink-0" />
          {label || 'Core Milestone'}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {label}
        </span>
      );
  }
};
