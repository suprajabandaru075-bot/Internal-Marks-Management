import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Student } from '../../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  studentToEdit?: Student | null;
  departments: string[];
  academicYears: string[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit,
  departments,
  academicYears,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(departments[0] || 'Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState(academicYears[0] || '1st Year');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState('A');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setRollNumber(studentToEdit.rollNumber);
      setDepartment(studentToEdit.department);
      setAcademicYear(studentToEdit.academicYear);
      setEmail(studentToEdit.email || '');
      setPhone(studentToEdit.phone || '');
      setSemester(studentToEdit.semester || 1);
      setSection(studentToEdit.section || 'A');
    } else {
      setName('');
      setRollNumber('');
      setDepartment(departments[0] || 'Computer Science & Engineering');
      setAcademicYear(academicYears[0] || '1st Year');
      setEmail('');
      setPhone('');
      setSemester(1);
      setSection('A');
    }
    setError(null);
  }, [studentToEdit, isOpen, departments, academicYears]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Roll Number is required.');
      return;
    }
    if (!department) {
      setError('Department selection is required.');
      return;
    }
    if (!academicYear) {
      setError('Academic Year selection is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        department,
        academicYear,
        email: email.trim(),
        phone: phone.trim(),
        semester: Number(semester) || 1,
        section: section.trim().toUpperCase(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student.');
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {studentToEdit ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <p className="text-xs text-slate-500">Student Academic Profile & Credentials</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 21CS001"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Must be unique across the college</span>
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
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {academicYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm uppercase text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bytexl.edu.in"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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
              {studentToEdit ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
