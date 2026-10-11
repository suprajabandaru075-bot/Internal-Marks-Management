import React, { useState } from 'react';
import {
  FileBarChart2,
  Printer,
  Download,
  Users,
  BookOpen,
  Building2,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  School,
} from 'lucide-react';
import { Student, Subject, Mark } from '../../types';
import { GradeBadge, DepartmentBadge } from '../common/Badge';

interface ReportsViewProps {
  students: Student[];
  subjects: Subject[];
  marks: Mark[];
  departments: string[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  subjects,
  marks,
  departments,
}) => {
  const [reportType, setReportType] = useState<'student' | 'subject' | 'department'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?._id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?._id || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(departments[0] || '');

  // Current selected student report data
  const currentStudent = students.find((s) => s._id === selectedStudentId);
  const studentMarks = marks.filter((m) => m.studentId === selectedStudentId);

  // Group marks by subject for mark sheet
  const subjectGroupMap = new Map<
    string,
    { subjectName: string; subjectCode: string; assessments: Mark[]; totalObtained: number; totalMax: number }
  >();

  studentMarks.forEach((m) => {
    if (!subjectGroupMap.has(m.subjectId)) {
      subjectGroupMap.set(m.subjectId, {
        subjectName: m.subjectName || 'Course',
        subjectCode: m.subjectCode || 'CODE',
        assessments: [],
        totalObtained: 0,
        totalMax: 0,
      });
    }
    const item = subjectGroupMap.get(m.subjectId)!;
    item.assessments.push(m);
    item.totalObtained += m.marksObtained;
    item.totalMax += m.maxMarks;
  });

  const subjectMarkList = Array.from(subjectGroupMap.values());
  const grandTotalObtained = studentMarks.reduce((a, b) => a + b.marksObtained, 0);
  const grandTotalMax = studentMarks.reduce((a, b) => a + b.maxMarks, 0);
  const overallPercentage =
    grandTotalMax > 0 ? Math.round((grandTotalObtained / grandTotalMax) * 100 * 10) / 10 : 0;

  const calculateOverallGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', status: 'DISTINCTION', gpa: 10.0 };
    if (pct >= 80) return { grade: 'A', status: 'EXCELLENT', gpa: 9.0 };
    if (pct >= 70) return { grade: 'B', status: 'FIRST CLASS', gpa: 8.0 };
    if (pct >= 60) return { grade: 'C', status: 'SECOND CLASS', gpa: 7.0 };
    if (pct >= 50) return { grade: 'D', status: 'PASS', gpa: 6.0 };
    return { grade: 'F', status: 'REAPPEAR', gpa: 0.0 };
  };

  const finalResult = calculateOverallGrade(overallPercentage);

  // Current selected subject report data
  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);
  const subjectMarks = marks.filter((m) => m.subjectId === selectedSubjectId);
  const subjectAvg =
    subjectMarks.length > 0
      ? Math.round(
          (subjectMarks.reduce((a, b) => a + (b.percentage || 0), 0) / subjectMarks.length) * 10
        ) / 10
      : 0;
  const subjectPassRate =
    subjectMarks.length > 0
      ? Math.round(
          (subjectMarks.filter((m) => (m.percentage || 0) >= 50).length / subjectMarks.length) * 100
        )
      : 0;
  const highestMark = subjectMarks.length > 0 ? Math.max(...subjectMarks.map((m) => m.marksObtained)) : 0;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export for Student Marksheet
  const exportStudentMarksheetCsv = () => {
    if (!currentStudent || studentMarks.length === 0) return;
    const headers = ['Subject Code', 'Subject Name', 'Assessment', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'Date'];
    const rows = studentMarks.map((m) => [
      `"${m.subjectCode}"`,
      `"${m.subjectName}"`,
      `"${m.assessmentName}"`,
      m.marksObtained,
      m.maxMarks,
      m.percentage,
      `"${m.grade}"`,
      `"${m.assessmentDate}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MarkSheet_${currentStudent.rollNumber}_${currentStudent.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Subject Report
  const exportSubjectReportCsv = () => {
    if (!currentSubject || subjectMarks.length === 0) return;
    const headers = ['Roll Number', 'Student Name', 'Assessment', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'Date'];
    const rows = subjectMarks.map((m) => [
      `"${m.rollNumber}"`,
      `"${m.studentName}"`,
      `"${m.assessmentName}"`,
      m.marksObtained,
      m.maxMarks,
      m.percentage,
      `"${m.grade}"`,
      `"${m.assessmentDate}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SubjectReport_${currentSubject.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Switcher (hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-blue-600" />
            Academic Reports & Mark Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal college mark sheets, subject evaluations, and department analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report / PDF
          </button>
        </div>
      </div>

      {/* Navigation Tabs (hidden in print) */}
      <div className="print:hidden flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType('student')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            reportType === 'student'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Student Mark Sheet
        </button>

        <button
          onClick={() => setReportType('subject')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            reportType === 'subject'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject Analysis Report
        </button>

        <button
          onClick={() => setReportType('department')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            reportType === 'department'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Comparison
        </button>
      </div>

      {/* ================= 1. STUDENT MARK SHEET ================= */}
      {reportType === 'student' && (
        <div className="space-y-6">
          {/* Student Selector Bar (hidden in print) */}
          <div className="print:hidden bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Select Candidate:
              </span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.rollNumber} — {s.name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportStudentMarksheetCsv}
              disabled={studentMarks.length === 0}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download Marksheet CSV
            </button>
          </div>

          {/* PRINTABLE MARK SHEET CARD */}
          {!currentStudent ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
              Please select a student to display their academic mark sheet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
              {/* College Header */}
              <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                    XL
                  </div>
                  <div className="text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                      BYTE XL Institute of Technology
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold">
                      Autonomous Institution • Approved by AICTE • Affiliated College
                    </p>
                  </div>
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  Official Internal Assessment Mark Sheet
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  ACADEMIC YEAR 2026–2027 • CONTINUOUS INTERNAL EVALUATION (CIE)
                </p>
              </div>

              {/* Candidate Info Grid */}
              <div className="my-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Candidate Name</span>
                  <p className="font-extrabold text-slate-900 text-sm">{currentStudent.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
                  <p className="font-extrabold text-slate-900 font-mono text-sm">
                    {currentStudent.rollNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-semibold text-slate-800">{currentStudent.department}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Class & Section</span>
                  <p className="font-semibold text-slate-800">
                    {currentStudent.academicYear} • Sem {currentStudent.semester || 1} ({currentStudent.section || 'A'})
                  </p>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Course Code & Name</th>
                      <th className="py-3 px-4">Assessments Logged</th>
                      <th className="py-3 px-4 text-center">Marks Scored</th>
                      <th className="py-3 px-4 text-center">Max Marks</th>
                      <th className="py-3 px-4 text-center">% Score</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectMarkList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No assessment marks recorded for this candidate yet.
                        </td>
                      </tr>
                    ) : (
                      subjectMarkList.map((item) => {
                        const pct = Math.round((item.totalObtained / item.totalMax) * 100 * 10) / 10;
                        const gr = calculateOverallGrade(pct).grade;

                        return (
                          <tr key={item.subjectCode} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-900 mr-2">
                                {item.subjectCode}
                              </span>
                              <span className="text-slate-800 font-medium">{item.subjectName}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {item.assessments.map((a) => a.assessmentName).join(', ')}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                              {item.totalObtained}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-slate-600">
                              {item.totalMax}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-blue-700">
                              {pct}%
                            </td>
                            <td className="py-3 px-4 text-center">
                              <GradeBadge grade={gr} size="sm" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {subjectMarkList.length > 0 && (
                    <tfoot className="bg-slate-100/80 font-bold border-t border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 uppercase tracking-wider text-xs">
                          Aggregate Total
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-sm">
                          {grandTotalObtained}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-sm">
                          {grandTotalMax}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-700 text-sm">
                          {overallPercentage}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <GradeBadge grade={finalResult.grade} size="sm" />
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Performance Verdict Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Result Status
                  </span>
                  <p className="font-black text-slate-900 text-base mt-0.5">{finalResult.status}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Grade Point Average (GPA)
                  </span>
                  <p className="font-black text-blue-700 text-base mt-0.5">
                    {finalResult.gpa.toFixed(1)} / 10.0
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Evaluations Evaluated
                  </span>
                  <p className="font-black text-slate-900 text-base mt-0.5">
                    {studentMarks.length} Assessment Entries
                  </p>
                </div>
              </div>

              {/* Institution Seal & Signature Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span>Class Advisor / Faculty</span>
                </div>
                <div className="text-center font-mono text-[10px] text-slate-400">
                  <span>Verified & Generated via BYTE XL Portal</span>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="font-bold text-slate-700">Dean of Academics</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. SUBJECT ANALYSIS REPORT ================= */}
      {reportType === 'subject' && (
        <div className="space-y-6">
          <div className="print:hidden bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Select Subject:
              </span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportSubjectReportCsv}
              disabled={subjectMarks.length === 0}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Download Subject CSV
            </button>
          </div>

          {currentSubject && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg">
                      {currentSubject.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg">{currentSubject.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentSubject.department} • Semester {currentSubject.semester} • Credits: {currentSubject.credits || 3}
                  </p>
                </div>
              </div>

              {/* Subject Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Evaluations</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{subjectMarks.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[11px] font-bold uppercase text-blue-700">Average Score</span>
                  <p className="text-xl font-black text-blue-900 mt-1">{subjectAvg}%</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold uppercase text-emerald-700">Pass Rate</span>
                  <p className="text-xl font-black text-emerald-900 mt-1">{subjectPassRate}%</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <span className="text-[11px] font-bold uppercase text-purple-700">Highest Mark</span>
                  <p className="text-xl font-black text-purple-900 mt-1">{highestMark}</p>
                </div>
              </div>

              {/* Subject Enrolled Marks Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectMarks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No marks recorded for this subject yet.
                        </td>
                      </tr>
                    ) : (
                      subjectMarks.map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {m.rollNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {m.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{m.assessmentName}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                            {m.marksObtained} / {m.maxMarks}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                            {m.percentage}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <GradeBadge grade={m.grade} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                            {m.assessmentDate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. DEPARTMENT COMPARISON ================= */}
      {reportType === 'department' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Department Academic Comparison</h3>
            <p className="text-xs text-slate-500">
              Comparative analysis across engineering disciplines for internal evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const deptStudents = students.filter((s) => s.department === dept);
              const deptMarks = marks.filter((m) => m.department === dept);
              const avg =
                deptMarks.length > 0
                  ? Math.round(
                      (deptMarks.reduce((a, b) => a + (b.percentage || 0), 0) / deptMarks.length) *
                        10
                    ) / 10
                  : 0;

              return (
                <div
                  key={dept}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{dept}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {deptStudents.length} Students Enrolled • {deptMarks.length} Evaluations
                      </p>
                    </div>
                    <span className="text-base font-extrabold text-blue-700 font-mono">
                      {avg}% Avg
                    </span>
                  </div>

                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, avg)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                    <span>Performance Benchmark: {avg >= 75 ? 'Above Target' : 'Standard'}</span>
                    <span className="font-semibold text-slate-700">Engineering Division</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
