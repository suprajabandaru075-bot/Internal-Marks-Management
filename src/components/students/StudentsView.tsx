import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import { Student, Mark } from '../../types';
import { DepartmentBadge } from '../common/Badge';
import { StudentFormModal } from './StudentFormModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface StudentsViewProps {
  students: Student[];
  allMarks: Mark[];
  departments: string[];
  academicYears: string[];
  onAddStudent: (data: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onOpenRecordMarks?: (studentId: string) => void;
  isLoading?: boolean;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  allMarks,
  departments,
  academicYears,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  isAddModalOpen,
  setIsAddModalOpen,
  onOpenRecordMarks,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToView, setStudentToView] = useState<(Student & { marks: Mark[] }) | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering
  const filtered = students.filter((s) => {
    const matchesSearch =
      search.trim() === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesYear = selectedYear === 'ALL' || s.academicYear === selectedYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleEditClick = (student: Student) => {
    setStudentToEdit(student);
  };

  const handleViewClick = (student: Student) => {
    const studentMarks = allMarks.filter((m) => m.studentId === student._id);
    setStudentToView({ ...student, marks: studentMarks });
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteStudent(studentToDelete._id);
      setStudentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportStudentsCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['Roll Number', 'Name', 'Department', 'Academic Year', 'Semester', 'Section', 'Email', 'Phone'];
    const rows = filtered.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.academicYear}"`,
      s.semester || 1,
      `"${s.section || 'A'}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bytexl_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Students Directory
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
              {filtered.length} {filtered.length === 1 ? 'Student' : 'Students'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enrolled student list with academic year, department records, and marks profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportStudentsCsv}
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
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, roll number, email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
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
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Academic Years</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {(search || selectedDept !== 'ALL' || selectedYear !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('ALL');
                setSelectedYear('ALL');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Year & Class</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Marks Entries</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No students found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || selectedDept !== 'ALL' || selectedYear !== 'ALL'
                        ? 'Try clearing the search or filters.'
                        : 'Click "Add Student" to enroll your first student.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((student) => {
                  const studentMarksCount = allMarks.filter((m) => m.studentId === student._id).length;

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tracking-tight">
                        {student.rollNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <DepartmentBadge department={student.department} />
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{student.academicYear}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Sem {student.semester || 1} • Sec {student.section || 'A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {student.email && (
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={student.email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {!student.email && !student.phone && (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs ${
                            studentMarksCount > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {studentMarksCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewClick(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="View Student Profile & Marks"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Student"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} students
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddStudent}
        departments={departments}
        academicYears={academicYears}
      />

      {/* Edit Modal */}
      <StudentFormModal
        isOpen={!!studentToEdit}
        onClose={() => setStudentToEdit(null)}
        onSubmit={async (data) => {
          if (studentToEdit) {
            await onUpdateStudent(studentToEdit._id, data);
            setStudentToEdit(null);
          }
        }}
        studentToEdit={studentToEdit}
        departments={departments}
        academicYears={academicYears}
      />

      {/* View Detail Modal */}
      <StudentDetailModal
        isOpen={!!studentToView}
        onClose={() => setStudentToView(null)}
        student={studentToView}
        onOpenRecordMarks={onOpenRecordMarks}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Delete Student"
        message={`Are you sure you want to delete student "${studentToDelete?.name}" (${studentToDelete?.rollNumber})? This will also remove any internal marks associated with this student.`}
        confirmLabel="Delete Student"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
