import React from 'react';
import { ShieldCheck, CheckCircle2, User, Zap } from 'lucide-react';

export interface BadgeProps {
  type?: 'verified' | 'completed_activity' | 'user_reported' | 'core' | 'demo' | 'info' | string;
  variant?: 'emerald' | 'indigo' | 'amber' | 'blue' | 'rose' | 'slate' | 'violet' | string;
  label?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  variant,
  label,
  children,
  size = 'sm',
  className = '',
}) => {
  const content = children || label;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  // If specific semantic type is provided
  if (type === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses} ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {content || 'Verified'}
      </span>
    );
  }
  if (type === 'completed_activity') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        {content || 'Completed Activity'}
      </span>
    );
  }
  if (type === 'user_reported') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses} ${className}`}>
        <User className="w-3 h-3 text-amber-600 shrink-0" />
        {content || 'User Reported'}
      </span>
    );
  }
  if (type === 'demo') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses} ${className}`}>
        {content || 'Demo Listing'}
      </span>
    );
  }
  if (type === 'core') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-violet-50 text-violet-700 border border-violet-200 ${sizeClasses} ${className}`}>
        <Zap className="w-3 h-3 text-violet-600 shrink-0" />
        {content || 'Core Milestone'}
      </span>
    );
  }

  // Variant color mapping
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    blue: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    violet: 'bg-violet-50 text-violet-700 border border-violet-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const styleClasses = colorMap[variant || ''] || colorMap[type || ''] || 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${styleClasses} ${sizeClasses} ${className}`}>
      {content}
    </span>
  );
};
