import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Save, AlertCircle, Search, Check } from 'lucide-react';
import { Student, Subject, Mark, AssessmentType } from '../../types';
import { GradeBadge } from '../common/Badge';

interface MarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    studentId: string;
    subjectId: string;
    assessmentName: string;
    maxMarks: number;
    marksObtained: number;
    assessmentDate: string;
    remarks?: string;
  }) => Promise<void>;
  markToEdit?: Mark | null;
  students: Student[];
  subjects: Subject[];
  initialStudentId?: string;
}

const ASSESSMENT_OPTIONS: AssessmentType[] = [
  'Internal Assessment 1',
  'Internal Assessment 2',
  'Internal Assessment 3',
  'Assignment',
  'Lab Internal',
  'Semester Quiz',
];

export const MarkFormModal: React.FC<MarkFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  markToEdit,
  students,
  subjects,
  initialStudentId,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessmentName, setAssessmentName] = useState<string>('Internal Assessment 1');
  const [maxMarks, setMaxMarks] = useState<number | string>(50);
  const [marksObtained, setMarksObtained] = useState<number | string>('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Student search dropdown state
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (markToEdit) {
      setSelectedStudentId(markToEdit.studentId);
      setSelectedSubjectId(markToEdit.subjectId);
      setAssessmentName(markToEdit.assessmentName);
      setMaxMarks(markToEdit.maxMarks);
      setMarksObtained(markToEdit.marksObtained);
      setAssessmentDate(markToEdit.assessmentDate || new Date().toISOString().split('T')[0]);
      setRemarks(markToEdit.remarks || '');
      const std = students.find((s) => s._id === markToEdit.studentId);
      if (std) setStudentSearch(`${std.rollNumber} - ${std.name}`);
    } else {
      const defaultStdId = initialStudentId || (students[0] ? students[0]._id : '');
      setSelectedStudentId(defaultStdId);
      const defaultSubId = subjects[0] ? subjects[0]._id : '';
      setSelectedSubjectId(defaultSubId);
      setAssessmentName('Internal Assessment 1');
      setMaxMarks(50);
      setMarksObtained('');
      setAssessmentDate(new Date().toISOString().split('T')[0]);
      setRemarks('');

      if (defaultStdId) {
        const std = students.find((s) => s._id === defaultStdId);
        if (std) setStudentSearch(`${std.rollNumber} - ${std.name}`);
      } else {
        setStudentSearch('');
      }
    }
    setError(null);
  }, [markToEdit, isOpen, students, subjects, initialStudentId]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s._id === selectedStudentId);
  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);

  // Filter subjects by student department if possible or show all
  const filteredSubjects = subjects.filter(
    (sub) => !currentStudent || sub.department === currentStudent.department
  );
  const displayedSubjects = filteredSubjects.length > 0 ? filteredSubjects : subjects;

  // Real-time calculation
  const numMax = Number(maxMarks);
  const numObtained = Number(marksObtained);
  const isValidScores =
    !isNaN(numMax) &&
    numMax > 0 &&
    !isNaN(numObtained) &&
    numObtained >= 0 &&
    numObtained <= numMax &&
    marksObtained !== '';

  const calculatedPercentage = isValidScores
    ? Math.round((numObtained / numMax) * 100 * 10) / 10
    : null;

  const getPreviewGrade = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const previewGrade = calculatedPercentage !== null ? getPreviewGrade(calculatedPercentage) : null;

  // Search filtered students for dropdown
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (!selectedSubjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!assessmentName.trim()) {
      setError('Assessment name is required.');
      return;
    }
    if (isNaN(numMax) || numMax <= 0) {
      setError('Maximum marks must be a positive number greater than 0.');
      return;
    }
    if (marksObtained === '' || isNaN(numObtained)) {
      setError('Marks obtained is required and must be numeric.');
      return;
    }
    if (numObtained < 0) {
      setError('Marks obtained cannot be negative.');
      return;
    }
    if (numObtained > numMax) {
      setError(`Marks obtained (${numObtained}) cannot exceed Maximum Marks (${numMax}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        studentId: selectedStudentId,
        subjectId: selectedSubjectId,
        assessmentName: assessmentName.trim(),
        maxMarks: numMax,
        marksObtained: numObtained,
        assessmentDate,
        remarks: remarks.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save marks entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {markToEdit ? 'Edit Internal Marks Entry' : 'Record Internal Marks'}
              </h3>
              <p className="text-xs text-slate-500">Student Assessment Score & Grade Evaluation</p>
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

          {/* Student Search & Select Dropdown */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setShowStudentDropdown(true);
                }}
                onFocus={() => setShowStudentDropdown(true)}
                placeholder="Search by name or roll number..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {showStudentDropdown && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1 divide-y divide-slate-50 text-xs">
                {filteredStudents.length === 0 ? (
                  <div className="p-3 text-slate-400 text-center">No student matches found</div>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      type="button"
                      key={s._id}
                      onClick={() => {
                        setSelectedStudentId(s._id);
                        setStudentSearch(`${s.rollNumber} - ${s.name}`);
                        setShowStudentDropdown(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900 mr-2">{s.rollNumber}</span>
                        <span className="text-slate-700 font-medium">{s.name}</span>
                        <p className="text-[11px] text-slate-400">{s.department}</p>
                      </div>
                      {selectedStudentId === s._id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Student Profile Snapshot banner */}
          {currentStudent && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {currentStudent.name} ({currentStudent.rollNumber})
                </p>
                <p className="text-slate-500 text-[11px]">{currentStudent.department}</p>
              </div>
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentStudent.academicYear}
              </span>
            </div>
          )}

          {/* Subject & Assessment Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {displayedSubjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assessment Type <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {ASSESSMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores & Calculation Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Marks <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="200"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Marks Obtained <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={numMax || 100}
                required
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                placeholder="e.g. 42"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Result Preview
              </label>
              <div className="h-10 flex items-center justify-between px-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {calculatedPercentage !== null ? `${calculatedPercentage}%` : '—'}
                </span>
                {previewGrade && <GradeBadge grade={previewGrade} size="sm" />}
              </div>
            </div>
          </div>

          {/* Date & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assessment Date
              </label>
              <input
                type="date"
                required
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Remarks / Faculty Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Good theoretical understanding"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              {markToEdit ? 'Save Changes' : 'Record Marks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
