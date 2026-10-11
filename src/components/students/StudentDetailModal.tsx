import React from 'react';
import { X, Mail, Phone, Calendar, BookOpen, Award, CheckCircle2, Printer } from 'lucide-react';
import { Student, Mark } from '../../types';
import { GradeBadge } from '../common/Badge';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: (Student & { marks?: Mark[] }) | null;
  onOpenRecordMarks?: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenRecordMarks,
}) => {
  if (!isOpen || !student) return null;

  const marks = student.marks || [];
  const totalEntries = marks.length;

  let averagePercentage = 0;
  let highestPercentage = 0;
  if (totalEntries > 0) {
    const sum = marks.reduce((acc, m) => acc + (m.percentage || 0), 0);
    averagePercentage = Math.round((sum / totalEntries) * 10) / 10;
    highestPercentage = Math.max(...marks.map((m) => m.percentage || 0));
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-blue-400/30">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl tracking-tight text-white">{student.name}</h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-xs font-mono font-bold">
                  {student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.department} • {student.academicYear} (Sem {student.semester || 1} - Sec {student.section || 'A'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Print Student Record"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Assessments</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{totalEntries}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-center">
              <span className="text-[11px] font-semibold text-blue-700 uppercase">Average Score</span>
              <p className="text-xl font-black text-blue-900 mt-0.5">{averagePercentage}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">Top Score</span>
              <p className="text-xl font-black text-emerald-900 mt-0.5">{highestPercentage}%</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Contact & Enrollment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.phone || 'No phone registered'}</span>
              </div>
            </div>
          </div>

          {/* Assessment Records */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Internal Marks Breakdown ({marks.length})
              </h4>
              {onOpenRecordMarks && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecordMarks(student._id);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  + Record Marks for Student
                </button>
              )}
            </div>

            {marks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No marks recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use the 'Record Marks' action to enter assessment scores for this student.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">%</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marks.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{m.subjectName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{m.subjectCode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{m.assessmentName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                          {m.marksObtained} / {m.maxMarks}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                          {m.percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <GradeBadge grade={m.grade} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                          {m.assessmentDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
