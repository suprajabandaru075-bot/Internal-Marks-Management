import React, { useState } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  Calendar,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { Mark, Student, Subject } from '../../types';
import { GradeBadge, DepartmentBadge } from '../common/Badge';
import { MarkFormModal } from './MarkFormModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface MarksViewProps {
  marks: Mark[];
  students: Student[];
  subjects: Subject[];
  departments: string[];
  onAddMark: (data: any) => Promise<void>;
  onUpdateMark: (id: string, data: any) => Promise<void>;
  onDeleteMark: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  initialStudentId?: string;
}

export const MarksView: React.FC<MarksViewProps> = ({
  marks,
  students,
  subjects,
  departments,
  onAddMark,
  onUpdateMark,
  onDeleteMark,
  isAddModalOpen,
  setIsAddModalOpen,
  initialStudentId,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedAssessment, setSelectedAssessment] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'percentage' | 'roll'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const [markToEdit, setMarkToEdit] = useState<Mark | null>(null);
  const [markToDelete, setMarkToDelete] = useState<Mark | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assessment options
  const assessmentOptions = Array.from(new Set(marks.map((m) => m.assessmentName)));

  // Filter & Sort
  const filtered = marks
    .filter((m) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        m.studentName?.toLowerCase().includes(q) ||
        m.rollNumber?.toLowerCase().includes(q) ||
        m.subjectName?.toLowerCase().includes(q) ||
        m.subjectCode?.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
      const matchesSub = selectedSubject === 'ALL' || m.subjectId === selectedSubject;
      const matchesAssess = selectedAssessment === 'ALL' || m.assessmentName === selectedAssessment;
      const matchesGrade = selectedGrade === 'ALL' || m.grade === selectedGrade;

      return matchesSearch && matchesDept && matchesSub && matchesAssess && matchesGrade;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime();
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'percentage') {
        const diff = (b.percentage || 0) - (a.percentage || 0);
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'roll') {
        const diff = (a.rollNumber || '').localeCompare(b.rollNumber || '');
        return sortAsc ? -diff : diff;
      }
      return 0;
    });

  const handleDeleteConfirm = async () => {
    if (!markToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteMark(markToDelete._id);
      setMarkToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportMarksCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Roll Number',
      'Student Name',
      'Department',
      'Subject Code',
      'Subject Name',
      'Assessment',
      'Marks Obtained',
      'Max Marks',
      'Percentage (%)',
      'Grade',
      'Assessment Date',
      'Remarks',
    ];

    const rows = filtered.map((m) => [
      `"${m.rollNumber}"`,
      `"${m.studentName}"`,
      `"${m.department}"`,
      `"${m.subjectCode}"`,
      `"${m.subjectName}"`,
      `"${m.assessmentName}"`,
      m.marksObtained,
      m.maxMarks,
      m.percentage,
      `"${m.grade}"`,
      `"${m.assessmentDate}"`,
      `"${m.remarks || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bytexl_internal_marks_${new Date().toISOString().split('T')[0]}.csv`);
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
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Internal Assessment Records
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
              {filtered.length} {filtered.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, edit, and evaluate all recorded internal examinations and assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportMarksCsv}
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
            <GraduationCap className="w-4 h-4" />
            Record Marks
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, roll number, or subject..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (sortField === 'percentage') setSortAsc(!sortAsc);
                else {
                  setSortField('percentage');
                  setSortAsc(false);
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 cursor-pointer font-medium ${
                sortField === 'percentage'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by % {sortField === 'percentage' && (sortAsc ? '↑' : '↓')}
            </button>

            <button
              onClick={() => {
                if (sortField === 'date') setSortAsc(!sortAsc);
                else {
                  setSortField('date');
                  setSortAsc(false);
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 cursor-pointer font-medium ${
                sortField === 'date'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Sort by Date {sortField === 'date' && (sortAsc ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

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
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Assessments</option>
            {assessmentOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Grades</option>
            {['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>

          {(search ||
            selectedDept !== 'ALL' ||
            selectedSubject !== 'ALL' ||
            selectedAssessment !== 'ALL' ||
            selectedGrade !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('ALL');
                setSelectedSubject('ALL');
                setSelectedAssessment('ALL');
                setSelectedGrade('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Marks Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assessment</th>
                <th className="py-3 px-4 text-center">Score Obtained</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No marks entries found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || selectedDept !== 'ALL' || selectedSubject !== 'ALL'
                        ? 'Try modifying your search or filter settings.'
                        : 'Click "Record Marks" to log the first assessment score.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((mark) => (
                  <tr key={mark._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {mark.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{mark.studentName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] font-bold text-slate-500">
                              {mark.rollNumber}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {mark.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{mark.subjectName}</p>
                      <span className="text-[11px] font-mono text-slate-400">{mark.subjectCode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {mark.assessmentName}
                      </span>
                      {mark.remarks && (
                        <p className="text-[10px] text-slate-400 mt-1 italic truncate max-w-[150px]">
                          "{mark.remarks}"
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {mark.marksObtained}
                      </span>
                      <span className="text-slate-400 font-mono text-xs"> / {mark.maxMarks}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-blue-600 text-sm">{mark.percentage}%</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <GradeBadge grade={mark.grade} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {mark.assessmentDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setMarkToEdit(mark)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          title="Edit Marks"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMarkToDelete(mark)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Marks"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <MarkFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddMark}
        students={students}
        subjects={subjects}
        initialStudentId={initialStudentId}
      />

      {/* Edit Modal */}
      <MarkFormModal
        isOpen={!!markToEdit}
        onClose={() => setMarkToEdit(null)}
        onSubmit={async (data) => {
          if (markToEdit) {
            await onUpdateMark(markToEdit._id, data);
            setMarkToEdit(null);
          }
        }}
        markToEdit={markToEdit}
        students={students}
        subjects={subjects}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!markToDelete}
        title="Delete Internal Marks Entry"
        message={`Are you sure you want to delete the "${markToDelete?.assessmentName}" marks entry for ${markToDelete?.studentName} in ${markToDelete?.subjectName}?`}
        confirmLabel="Delete Marks"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setMarkToDelete(null)}
      />
    </div>
  );
};
