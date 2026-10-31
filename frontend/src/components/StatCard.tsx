import React from 'react';
import { Card, CardContent } from './Card.js';
import { cn } from '../lib/utils.js';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  indicatorColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  indicatorColor = 'cyan',
  className,
}) => {
  const colorGradients = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    slate: 'from-slate-500/10 to-transparent border-slate-700/40 text-slate-400',
  };

  return (
    <Card className={cn('relative overflow-hidden bg-gradient-to-br', colorGradients[indicatorColor], className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-inner">
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
            {value}
          </div>
          {trend && (
            <span
              className={cn(
                'text-xs font-mono font-medium',
                trend.positive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-sans">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
