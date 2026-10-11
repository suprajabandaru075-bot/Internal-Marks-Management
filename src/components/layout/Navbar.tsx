import React, { useState } from 'react';
import {
  Menu,
  Database,
  UserCheck,
  Plus,
  Printer,
  ChevronDown,
  LogOut,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { DbStatus, User } from '../../types';

interface NavbarProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  dbStatus: DbStatus | null;
  onOpenDbModal: () => void;
  currentUser: User;
  onSwitchRole: (role: 'admin' | 'faculty') => void;
  onOpenAddMarks: () => void;
  onOpenAddStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  dbStatus,
  onOpenDbModal,
  currentUser,
  onSwitchRole,
  onOpenAddMarks,
  onOpenAddStudent,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const pageTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time performance analytics & college assessment metrics',
    },
    students: {
      title: 'Student Directory',
      subtitle: 'Manage student records, enrollment, and department directories',
    },
    marks: {
      title: 'Internal Marks Management',
      subtitle: 'Record, evaluate, and audit student internal assessment scores',
    },
    subjects: {
      title: 'Curriculum & Subjects',
      subtitle: 'Manage courses, credits, and department subject allocations',
    },
    reports: {
      title: 'Academic Reports & Mark Sheets',
      subtitle: 'Generate printable scorecards, subject analyses, and export CSVs',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Database configuration, academic scales, and data backups',
    },
  };

  const currentInfo = pageTitles[activeTab] || {
    title: 'BYTE XL Portal',
    subtitle: 'Student Academic Portal',
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Quick actions, DB status, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenAddStudent}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Student
          </button>
          <button
            onClick={onOpenAddMarks}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Record Marks
          </button>
        </div>

        {/* Database Status Badge */}
        <button
          onClick={onOpenDbModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
          title="View Database & Backend Status"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline text-[11px] font-semibold text-slate-600">
            {dbStatus?.mode === 'mongodb' ? 'MongoDB Connected' : 'Persistent Store'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-600">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase tracking-wide">
                  <UserCheck className="w-3 h-3" />
                  Role: {currentUser.role}
                </div>
              </div>

              <div className="px-2 py-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                  Switch Active Role
                </p>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-50 font-bold text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Administrator</span>
                  {currentUser.role === 'admin' && <span className="text-blue-600">✓</span>}
                </button>
                <button
                  onClick={() => onSwitchRole('faculty')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    currentUser.role === 'faculty'
                      ? 'bg-blue-50 font-bold text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Faculty / Staff</span>
                  {currentUser.role === 'faculty' && <span className="text-blue-600">✓</span>}
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 px-2">
                <button
                  onClick={onOpenDbModal}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  Backend Storage Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
