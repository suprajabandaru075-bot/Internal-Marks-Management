import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Server,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { DbStatus, User } from '../../types';

interface SettingsViewProps {
  dbStatus: DbStatus | null;
  onResetSeed: () => Promise<void>;
  isResetting: boolean;
  onExportBackup: () => Promise<void>;
  onImportBackup: (backup: any) => Promise<void>;
  currentUser: User;
  onSwitchRole: (role: 'admin' | 'faculty') => void;
  onOpenDbModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  dbStatus,
  onResetSeed,
  isResetting,
  onExportBackup,
  onImportBackup,
  currentUser,
  onSwitchRole,
  onOpenDbModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const gradingScales = [
    { grade: 'A+', range: '90% — 100%', gpa: '10.0', classification: 'Distinction / Outstanding' },
    { grade: 'A', range: '80% — 89.9%', gpa: '9.0', classification: 'Excellent / Very Good' },
    { grade: 'B', range: '70% — 79.9%', gpa: '8.0', classification: 'Good / First Class' },
    { grade: 'C', range: '60% — 69.9%', gpa: '7.0', classification: 'Above Average / Second Class' },
    { grade: 'D', range: '50% — 59.9%', gpa: '6.0', classification: 'Pass Mark' },
    { grade: 'F', range: 'Below 50%', gpa: '0.0', classification: 'Fail / Reappear' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImporting(true);
        setImportStatus(null);
        const json = JSON.parse(event.target?.result as string);
        await onImportBackup(json);
        setImportStatus('Backup restored successfully!');
      } catch (err: any) {
        setImportStatus('Invalid JSON backup file or restore failed.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          System Settings & Database Architecture
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure academic evaluation parameters, database persistence, and administrative controls.
        </p>
      </div>

      {/* Database & Persistence Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Database Configuration & Status</h3>
              <p className="text-xs text-slate-500">
                Hybrid Storage Engine: MongoDB via Mongoose + Embedded File-backed JSON Database
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDbModal}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Detailed Metrics →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Storage Mode:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {dbStatus?.mode === 'mongodb' ? 'MongoDB (Mongoose)' : 'Embedded Persistent Store'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Name:</span>
              <span className="font-mono text-slate-800">{dbStatus?.databaseName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Host / Engine:</span>
              <span className="font-mono text-slate-800">{dbStatus?.host}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Live Express API:</span>
              <span className="font-mono text-emerald-600 font-bold">http://localhost:3000/api</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Record Counts:</span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Students</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dbStatus?.collections.students ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Subjects</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dbStatus?.collections.subjects ?? 0}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Marks</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dbStatus?.collections.marks ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Management Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onExportBackup}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download JSON Backup
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Restore from Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          <button
            onClick={onResetSeed}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            Reset to Sample Seed Data
          </button>
        </div>

        {importStatus && (
          <p className="text-xs font-semibold text-emerald-700 mt-2">{importStatus}</p>
        )}
      </div>

      {/* User Role & Access Control */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">User Roles & Access Permissions</h3>
            <p className="text-xs text-slate-500">
              Switch role profile between College Administrator and Academic Faculty
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onSwitchRole('admin')}
            className={`p-4 rounded-xl border-2 transition cursor-pointer ${
              currentUser.role === 'admin'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">College Administrator</span>
              {currentUser.role === 'admin' && (
                <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Full privileges: enroll/delete students, add curriculum subjects, enter/edit marks,
              audit database.
            </p>
          </div>

          <div
            onClick={() => onSwitchRole('faculty')}
            className={`p-4 rounded-xl border-2 transition cursor-pointer ${
              currentUser.role === 'faculty'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Faculty / Staff</span>
              {currentUser.role === 'faculty' && (
                <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Academic staff: input internal scores, view student directories, print mark sheets,
              and subject reports.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Grading Scale Reference */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Academic Grading Scale & SGPA Standard</h3>
            <p className="text-xs text-slate-500">
              Institutional benchmark for Continuous Internal Assessment (CIE)
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Grade</th>
                <th className="py-2.5 px-4">Percentage Score Range</th>
                <th className="py-2.5 px-4 text-center">Grade Point (GPA)</th>
                <th className="py-2.5 px-4">Performance Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradingScales.map((item) => (
                <tr key={item.grade} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-sm">
                    {item.grade}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 font-medium">{item.range}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-700">
                    {item.gpa}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{item.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
