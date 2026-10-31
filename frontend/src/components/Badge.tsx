import React from 'react';
import { cn } from '../lib/utils.js';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    destructive: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    outline: 'border-slate-700 text-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-md border tracking-wider transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const MethodBadge: React.FC<{ method: string; className?: string }> = ({ method, className }) => {
  const m = method.toUpperCase();
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  if (m === 'GET') color = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40';
  else if (m === 'POST') color = 'bg-sky-950/70 text-sky-400 border-sky-500/40';
  else if (m === 'PUT') color = 'bg-amber-950/70 text-amber-400 border-amber-500/40';
  else if (m === 'PATCH') color = 'bg-purple-950/70 text-purple-400 border-purple-500/40';
  else if (m === 'DELETE') color = 'bg-rose-950/70 text-rose-400 border-rose-500/40';
  else if (m === 'HEAD') color = 'bg-teal-950/70 text-teal-400 border-teal-500/40';
  else if (m === 'OPTIONS') color = 'bg-indigo-950/70 text-indigo-400 border-indigo-500/40';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono font-bold text-[11px] px-2 py-0.5 rounded border min-w-[58px]',
        color,
        className
      )}
    >
      {m}
    </span>
  );
};

export const StatusBadge: React.FC<{ statusCode: number; className?: string }> = ({ statusCode, className }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  if (statusCode >= 200 && statusCode < 300) {
    color = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
  } else if (statusCode >= 300 && statusCode < 400) {
    color = 'bg-blue-950/60 text-blue-400 border-blue-500/40';
  } else if (statusCode >= 400 && statusCode < 500) {
    color = 'bg-amber-950/60 text-amber-400 border-amber-500/40';
  } else if (statusCode >= 500) {
    color = 'bg-rose-950/60 text-rose-400 border-rose-500/40';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono font-bold text-[11px] px-2 py-0.5 rounded border min-w-[42px]',
        color,
        className
      )}
    >
      {statusCode || 'ERR'}
    </span>
  );
};
