import React, { useState, useEffect } from 'react';
import { X, BookPlus, Save, AlertCircle } from 'lucide-react';
import { Subject } from '../../types';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  subjectToEdit?: Subject | null;
  departments: string[];
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subjectToEdit,
  departments,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState(departments[0] || 'Computer Science & Engineering');
  const [semester, setSemester] = useState<number>(1);
  const [credits, setCredits] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setDepartment(subjectToEdit.department);
      setSemester(subjectToEdit.semester);
      setCredits(subjectToEdit.credits || 3);
    } else {
      setName('');
      setCode('');
      setDepartment(departments[0] || 'Computer Science & Engineering');
      setSemester(1);
      setCredits(3);
    }
    setError(null);
  }, [subjectToEdit, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Subject Name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Subject Code is required.');
      return;
    }
    if (!department) {
      setError('Department is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        department,
        semester: Number(semester) || 1,
        credits: Number(credits) || 3,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {subjectToEdit ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <p className="text-xs text-slate-500">Curriculum Course & Department Allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS201"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Unique identifier code</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester (1 - 8)
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {subjectToEdit ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
