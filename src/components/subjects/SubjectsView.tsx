import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { Subject, Mark } from '../../types';
import { DepartmentBadge } from '../common/Badge';
import { SubjectFormModal } from './SubjectFormModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface SubjectsViewProps {
  subjects: Subject[];
  marks: Mark[];
  departments: string[];
  onAddSubject: (data: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  marks,
  departments,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');

  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesSem = selectedSem === 'ALL' || s.semester === Number(selectedSem);

    return matchesSearch && matchesDept && matchesSem;
  });

  const handleDeleteClick = (subject: Subject) => {
    const associatedMarksCount = marks.filter((m) => m.subjectId === subject._id).length;
    if (associatedMarksCount > 0) {
      setDeleteWarning(
        `Cannot delete "${subject.code} — ${subject.name}" because ${associatedMarksCount} internal marks record(s) exist for it. Please remove or reassign those assessment scores first.`
      );
      setSubjectToDelete(null);
    } else {
      setDeleteWarning(null);
      setSubjectToDelete(subject);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteSubject(subjectToDelete._id);
      setSubjectToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportSubjectsCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['Subject Code', 'Subject Name', 'Department', 'Semester', 'Credits', 'Assessment Entries'];
    const rows = filtered.map((s) => {
      const entries = marks.filter((m) => m.subjectId === s._id).length;
      return [
        `"${s.code}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        s.semester,
        s.credits || 3,
        entries,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bytexl_subjects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Curriculum Subjects
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
              {filtered.length} {filtered.length === 1 ? 'Course' : 'Courses'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Department courses, course codes, credit weightages, and semester assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportSubjectsCsv}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Delete Warning Notice */}
      {deleteWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Blocked by Referential Integrity</p>
              <p className="mt-0.5">{deleteWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteWarning(null)}
            className="text-amber-700 hover:text-amber-900 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or subject name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>
                Semester {s}
              </option>
            ))}
          </select>

          {(search || selectedDept !== 'ALL' || selectedSem !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('ALL');
                setSelectedSem('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4 text-center">Marks Logged</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No subjects found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || selectedDept !== 'ALL'
                        ? 'Try modifying your filter settings.'
                        : 'Click "Add Subject" to define a curriculum course.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const associatedMarks = marks.filter((m) => m.subjectId === sub._id);
                  const marksCount = associatedMarks.length;

                  return (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tracking-wider">
                        {sub.code}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {sub.name}
                      </td>

                      <td className="py-3.5 px-4">
                        <DepartmentBadge department={sub.department} />
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        Sem {sub.semester}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-800">
                          {sub.credits || 3}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                            marksCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {marksCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSubjectToEdit(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <SubjectFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddSubject}
        departments={departments}
      />

      {/* Edit Modal */}
      <SubjectFormModal
        isOpen={!!subjectToEdit}
        onClose={() => setSubjectToEdit(null)}
        onSubmit={async (data) => {
          if (subjectToEdit) {
            await onUpdateSubject(subjectToEdit._id, data);
            setSubjectToEdit(null);
          }
        }}
        subjectToEdit={subjectToEdit}
        departments={departments}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!subjectToDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete subject "${subjectToDelete?.code} - ${subjectToDelete?.name}"?`}
        confirmLabel="Delete Subject"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
};
