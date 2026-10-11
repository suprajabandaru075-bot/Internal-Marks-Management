import React, { useState, useEffect, useCallback } from 'react';
import {
  Student,
  Subject,
  Mark,
  DashboardStats,
  DbStatus,
  User,
} from './types';
import { api } from './services/api';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Toast, ToastMessage } from './components/common/Toast';
import { DbStatusModal } from './components/common/DbStatusModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { MarksView } from './components/marks/MarksView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { MarkFormModal } from './components/marks/MarkFormModal';
import { SubjectFormModal } from './components/subjects/SubjectFormModal';
import { StudentFormModal } from './components/students/StudentFormModal';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  // Departments list for filters & select dropdowns
  const [departments, setDepartments] = useState<string[]>([
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Electrical & Electronics Engineering',
  ]);

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Current User Session
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-admin-1',
    name: 'Dr. Suresh Kumar',
    email: 'admin.academics@bytexl.edu.in',
    role: 'admin',
    department: 'Computer Science & Engineering',
  });

  // Modal controls
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddMarksModalOpen, setIsAddMarksModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [initialStudentIdForMarks, setInitialStudentIdForMarks] = useState<string>('');

  // Status & Notifications
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Central Data Loader
  const loadPortalData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const [statsData, studentsRes, subjectsData, marksData, statusData] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents({ limit: 200 }),
        api.getSubjects(),
        api.getMarks(),
        api.getDbStatus(),
      ]);

      setDashboardStats(statsData);
      setStudents(studentsRes.data);
      setSubjects(subjectsData);
      setMarks(marksData);
      setDbStatus(statusData);

      // Extract unique departments from students and subjects
      const deptSet = new Set<string>(departments);
      studentsRes.data.forEach((s) => deptSet.add(s.department));
      subjectsData.forEach((s) => deptSet.add(s.department));
      setDepartments(Array.from(deptSet));
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err.message || 'Failed to connect to backend server. Please check that the API is running.');
      if (!silent) {
        addToast('error', 'API Connection Failure', err.message);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [departments]);

  useEffect(() => {
    loadPortalData();
  }, []);

  // Handlers for Students CRUD
  const handleAddStudent = async (data: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newStudent = await api.createStudent(data);
      addToast('success', 'Student Enrolled', `${newStudent.name} (${newStudent.rollNumber}) added successfully.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
      throw err;
    }
  };

  const handleUpdateStudent = async (id: string, data: Partial<Student>) => {
    try {
      const updated = await api.updateStudent(id, data);
      addToast('success', 'Student Updated', `Details for ${updated.name} have been updated.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const deleted = await api.deleteStudent(id);
      addToast('success', 'Student Removed', `Student ${deleted.name} (${deleted.rollNumber}) was deleted.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
      throw err;
    }
  };

  // Handlers for Subjects CRUD
  const handleAddSubject = async (data: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSubject = await api.createSubject(data);
      addToast('success', 'Subject Added', `${newSubject.code} — ${newSubject.name} created.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Subject Creation Failed', err.message);
      throw err;
    }
  };

  const handleUpdateSubject = async (id: string, data: Partial<Subject>) => {
    try {
      const updated = await api.updateSubject(id, data);
      addToast('success', 'Subject Updated', `${updated.code} has been modified.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const deleted = await api.deleteSubject(id);
      addToast('success', 'Subject Deleted', `${deleted.code} — ${deleted.name} was removed.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Cannot Delete Subject', err.message);
      throw err;
    }
  };

  // Handlers for Marks CRUD
  const handleAddMark = async (data: any) => {
    try {
      const newMark = await api.createMark(data);
      addToast(
        'success',
        'Marks Logged',
        `Recorded ${newMark.marksObtained}/${newMark.maxMarks} (${newMark.percentage}%) for ${newMark.studentName}.`
      );
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Evaluation Recording Failed', err.message);
      throw err;
    }
  };

  const handleUpdateMark = async (id: string, data: any) => {
    try {
      const updated = await api.updateMark(id, data);
      addToast('success', 'Marks Updated', `Updated ${updated.assessmentName} for ${updated.studentName}.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  const handleDeleteMark = async (id: string) => {
    try {
      const deleted = await api.deleteMark(id);
      addToast('success', 'Marks Removed', `Assessment entry for ${deleted.studentName} deleted.`);
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
      throw err;
    }
  };

  // Reset Sample Seed Data
  const handleResetSeed = async () => {
    try {
      setIsResetting(true);
      const status = await api.resetDbSeed();
      setDbStatus(status);
      addToast('info', 'Database Reset', 'Default student, subject, and marks records reloaded.');
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Backup & Restore
  const handleExportBackup = async () => {
    try {
      const data = {
        students,
        subjects,
        marks,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bytexl_academic_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Backup Exported', 'Downloaded complete database JSON snapshot.');
    } catch (err: any) {
      addToast('error', 'Export Failed', err.message);
    }
  };

  const handleImportBackup = async (backupPayload: any) => {
    try {
      const status = await api.importDatabase(backupPayload);
      setDbStatus(status);
      addToast('success', 'Database Restored', 'Imported backup payload successfully.');
      await loadPortalData(true);
    } catch (err: any) {
      addToast('error', 'Restore Failed', err.message);
      throw err;
    }
  };

  const handleSwitchRole = (role: 'admin' | 'faculty') => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name: role === 'admin' ? 'Dr. Suresh Kumar (Dean)' : 'Prof. Ramesh Rao (Faculty)',
    }));
    addToast('info', 'Role Switched', `Active session switched to ${role === 'admin' ? 'Administrator' : 'Faculty'}.`);
  };

  const handleOpenRecordMarksForStudent = (studentId: string) => {
    setInitialStudentIdForMarks(studentId);
    setIsAddMarksModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        counts={{
          students: students.length,
          marks: marks.length,
          subjects: subjects.length,
        }}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          dbStatus={dbStatus}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenAddMarks={() => {
            setInitialStudentIdForMarks('');
            setIsAddMarksModalOpen(true);
          }}
          onOpenAddStudent={() => setIsAddStudentModalOpen(true)}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="mx-4 md:mx-8 mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Backend API Communication Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadPortalData()}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Main View Router */}
        <main className="flex-1 p-4 md:p-8">
          {isLoading && !dashboardStats ? (
            <div className="py-28 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-xs font-semibold text-slate-600">
                Connecting to BYTE XL Academic Portal Backend...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={dashboardStats}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAddStudent={() => setIsAddStudentModalOpen(true)}
                  onOpenAddMarks={() => {
                    setInitialStudentIdForMarks('');
                    setIsAddMarksModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  allMarks={marks}
                  departments={departments}
                  academicYears={academicYears}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  isAddModalOpen={isAddStudentModalOpen}
                  setIsAddModalOpen={setIsAddStudentModalOpen}
                  onOpenRecordMarks={handleOpenRecordMarksForStudent}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'marks' && (
                <MarksView
                  marks={marks}
                  students={students}
                  subjects={subjects}
                  departments={departments}
                  onAddMark={handleAddMark}
                  onUpdateMark={handleUpdateMark}
                  onDeleteMark={handleDeleteMark}
                  isAddModalOpen={isAddMarksModalOpen}
                  setIsAddModalOpen={setIsAddMarksModalOpen}
                  initialStudentId={initialStudentIdForMarks}
                />
              )}

              {activeTab === 'subjects' && (
                <SubjectsView
                  subjects={subjects}
                  marks={marks}
                  departments={departments}
                  onAddSubject={handleAddSubject}
                  onUpdateSubject={handleUpdateSubject}
                  onDeleteSubject={handleDeleteSubject}
                  isAddModalOpen={isAddSubjectModalOpen}
                  setIsAddModalOpen={setIsAddSubjectModalOpen}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  students={students}
                  subjects={subjects}
                  marks={marks}
                  departments={departments}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  dbStatus={dbStatus}
                  onResetSeed={handleResetSeed}
                  isResetting={isResetting}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  currentUser={currentUser}
                  onSwitchRole={handleSwitchRole}
                  onOpenDbModal={() => setIsDbModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Database Diagnostics Modal */}
      <DbStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={dbStatus}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
      />

      {/* Global Quick Add Subject Modal */}
      <SubjectFormModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        onSubmit={handleAddSubject}
        departments={departments}
      />
    </div>
  );
}
