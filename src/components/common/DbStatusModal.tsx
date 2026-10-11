import React from 'react';
import { Database, Server, CheckCircle2, RefreshCw, X, HardDrive } from 'lucide-react';
import { DbStatus } from '../../types';

interface DbStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DbStatus | null;
  onResetSeed: () => Promise<void>;
  isResetting: boolean;
}

export const DbStatusModal: React.FC<DbStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onResetSeed,
  isResetting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Database & Backend Engine</h3>
              <p className="text-xs text-slate-500">BYTE XL Architecture & Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Mode Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-800 text-sm">
                Active Store:{' '}
                <span className="text-emerald-700">
                  {status?.mode === 'mongodb' ? 'MongoDB with Mongoose (Atlas / Remote)' : 'Persistent Embedded Engine (JSON File-backed)'}
                </span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                {status?.mode === 'mongodb'
                  ? 'Connected to configured MongoDB URI via Mongoose models and schemas.'
                  : 'Operating via the embedded file-backed database layer. All Student, Subject, and Marks CRUD mutations persist instantly to disk (.data/academic_portal_db.json) across browser refreshes and server reboots.'}
              </p>
            </div>
          </div>

          {/* Collection Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Students</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {status?.collections.students ?? 0}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Subjects</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {status?.collections.subjects ?? 0}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Marks Entries</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {status?.collections.marks ?? 0}
              </p>
            </div>
          </div>

          {/* Environment Info */}
          <div className="text-xs space-y-2 bg-slate-900 text-slate-300 p-4 rounded-xl font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Database Name:</span>
              <span className="text-slate-200">{status?.databaseName || 'bytexl_academic_portal'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Backend API:</span>
              <span className="text-emerald-400">/api (Express.js)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Synced:</span>
              <span className="text-slate-200">{status?.lastSyncedAt?.split('T')[1].slice(0, 8) || 'Just now'}</span>
            </div>
          </div>

          {/* Reset Seed Action */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={onResetSeed}
              disabled={isResetting}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              Reset to Clean Sample Seed Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
