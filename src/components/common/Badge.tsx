import React from 'react';

interface GradeBadgeProps {
  grade?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade = 'N/A', size = 'md' }) => {
  const g = grade.toUpperCase();

  const styles: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    A: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    B: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    C: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
    D: 'bg-orange-50 text-orange-800 border-orange-200 font-medium',
    F: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const baseStyle = styles[g] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-mono tracking-tight ${sizeClasses[size]} ${baseStyle}`}
    >
      {grade}
    </span>
  );
};

export const DepartmentBadge: React.FC<{ department: string; short?: boolean }> = ({
  department,
  short = false,
}) => {
  const getAbbrev = (dept: string) => {
    if (dept.includes('Computer Science')) return 'CSE';
    if (dept.includes('Electronics & Comm')) return 'ECE';
    if (dept.includes('Information Tech')) return 'IT';
    if (dept.includes('Mechanical')) return 'MECH';
    if (dept.includes('Electrical & Elect')) return 'EEE';
    return dept;
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
      {short ? getAbbrev(department) : department}
    </span>
  );
};
