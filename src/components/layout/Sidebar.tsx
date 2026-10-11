import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  School,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'students' | 'marks' | 'subjects' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  counts?: { students: number; marks: number; subjects: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  counts,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.FC<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: counts?.students },
    { id: 'marks', label: 'Internal Marks', icon: GraduationCap, badge: counts?.marks },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: counts?.subjects },
    { id: 'reports', label: 'Reports & Mark Sheets', icon: FileBarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-slate-900 text-white flex flex-col border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black tracking-wider text-white text-base shadow-md shrink-0">
            XL
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white leading-tight flex items-center gap-1.5">
                BYTE XL
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
                  PORTAL
                </span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Academic System</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:flex items-center justify-center"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* College Info Chip */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <School className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Institute of Technology</p>
            <p className="text-[10px] text-slate-400 truncate">Autonomous College • Affiliated</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono text-[11px] ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        {!collapsed ? (
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">v2.4</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
              title="System Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
