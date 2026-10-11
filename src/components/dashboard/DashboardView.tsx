import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserPlus,
  PlusCircle,
  FileBarChart2,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, Mark } from '../../types';
import { StatCard } from '../common/StatCard';
import { GradeBadge, DepartmentBadge } from '../common/Badge';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: 'students' | 'marks' | 'subjects' | 'reports') => void;
  onOpenAddStudent: () => void;
  onOpenAddMarks: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigateTab,
  onOpenAddStudent,
  onOpenAddMarks,
}) => {
  if (!stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-semibold">Loading academic dashboard analytics...</p>
      </div>
    );
  }

  const {
    totalStudents,
    totalMarksEntries,
    totalSubjects,
    averageMarksPercentage,
    departmentSummary,
    subjectOverview,
    recentMarks,
    assessmentDistribution,
    gradeDistribution,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              BYTE XL Academic Performance Suite
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Internal Assessment Dashboard
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
              Track student internal evaluations across engineering departments, audit score
              variations, and generate formal institution mark sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 backdrop-blur-xs cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-blue-300" />
              Add Student
            </button>
            <button
              onClick={onOpenAddMarks}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Record Marks
            </button>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled students"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Total Marks Entries"
          value={totalMarksEntries}
          subtitle="Evaluations logged"
          icon={GraduationCap}
          accentColor="indigo"
        />
        <StatCard
          title="Curriculum Subjects"
          value={totalSubjects}
          subtitle="Active courses"
          icon={BookOpen}
          accentColor="amber"
        />
        <StatCard
          title="Average Internal Marks"
          value={`${averageMarksPercentage}%`}
          subtitle="Institution mean"
          icon={TrendingUp}
          accentColor="emerald"
        />
      </div>

      {/* Analytics Row: Department Summary & Grade Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Department Summary</h3>
                <p className="text-xs text-slate-500">
                  Student distribution and average marks performance by branch
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('students')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                View Students <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {departmentSummary.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No department records yet.</p>
              ) : (
                departmentSummary.map((dept) => {
                  const pct = Math.min(100, dept.averageMarks);
                  return (
                    <div key={dept.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{dept.department}</span>
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {dept.studentCount} {dept.studentCount === 1 ? 'student' : 'students'}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">
                          {dept.averageMarks}% avg
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Branch Coverage: 100% active</span>
            <span className="font-semibold text-slate-700">Engineering & Tech</span>
          </div>
        </div>

        {/* Grade Distribution & Performance Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Grade Distribution</h3>
              <p className="text-xs text-slate-500">Calculated across all internal exams</p>
            </div>

            <div className="mt-4 space-y-3">
              {gradeDistribution.map((item) => {
                const total = totalMarksEntries || 1;
                const ratio = Math.round((item.count / total) * 100);
                return (
                  <div key={item.grade} className="flex items-center gap-3 text-xs">
                    <GradeBadge grade={item.grade} size="sm" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-700 w-12 text-right">
                      {item.count} ({ratio}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200/80"
            >
              <FileBarChart2 className="w-3.5 h-3.5 text-blue-600" />
              Generate Academic Mark Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Subject-wise Overview Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Subject-wise Marks Overview</h3>
            <p className="text-xs text-slate-500">
              Average scores, evaluation volume, and pass rates across registered courses
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Manage Subjects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Evaluations</th>
                <th className="py-2.5 px-3 text-center">Average Score</th>
                <th className="py-2.5 px-3 text-center">Pass Rate (≥50%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectOverview.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No subjects configured yet.
                  </td>
                </tr>
              ) : (
                subjectOverview.map((sub) => (
                  <tr key={sub.subjectCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{sub.subjectName}</p>
                      <span className="font-mono text-[10px] text-slate-400">{sub.subjectCode}</span>
                    </td>
                    <td className="py-3 px-3">
                      <DepartmentBadge department={sub.department} short />
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {sub.totalEntries}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-blue-600 font-mono text-sm">
                        {sub.averageMarks}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                          sub.passPercentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.passPercentage >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.passPercentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Marks Entries Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Assessment Entries</h3>
            <p className="text-xs text-slate-500">Most recent internal mark submissions and grades</p>
          </div>
          <button
            onClick={() => onNavigateTab('marks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            All Marks Records <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Assessment</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMarks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent marks recorded. Click "Record Marks" to enter scores.
                  </td>
                </tr>
              ) : (
                recentMarks.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{m.studentName}</p>
                      <span className="font-mono text-[10px] text-slate-400">{m.rollNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-800 font-medium">{m.subjectName}</p>
                      <span className="font-mono text-[10px] text-slate-400">{m.subjectCode}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.assessmentName}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {m.marksObtained} / {m.maxMarks}{' '}
                      <span className="text-blue-600 text-[11px]">({m.percentage}%)</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={m.grade} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {m.assessmentDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
