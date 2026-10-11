import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accentColor?: 'blue' | 'indigo' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  accentColor = 'blue',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              {value}
            </span>
            {subtitle && <span className="text-xs font-medium text-slate-500">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              trendDirection === 'up'
                ? 'text-emerald-600'
                : trendDirection === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {trend}
          </span>
          <span className="text-slate-400">vs last assessment</span>
        </div>
      )}
    </div>
  );
};
