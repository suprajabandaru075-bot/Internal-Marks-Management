export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  department: string;
  academicYear: string;
  email?: string;
  phone?: string;
  semester?: number;
  section?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType =
  | 'Internal Assessment 1'
  | 'Internal Assessment 2'
  | 'Internal Assessment 3'
  | 'Assignment'
  | 'Lab Internal'
  | 'Semester Quiz';

export interface Mark {
  _id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  department?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  assessmentName: AssessmentType | string;
  maxMarks: number;
  marksObtained: number;
  percentage?: number;
  grade?: string;
  assessmentDate: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalMarksEntries: number;
  totalSubjects: number;
  averageMarksPercentage: number;
  departmentSummary: {
    department: string;
    studentCount: number;
    averageMarks: number;
  }[];
  subjectOverview: {
    subjectName: string;
    subjectCode: string;
    department: string;
    averageMarks: number;
    totalEntries: number;
    passPercentage: number;
  }[];
  recentMarks: Mark[];
  assessmentDistribution: {
    assessmentName: string;
    count: number;
    averagePercentage: number;
  }[];
  gradeDistribution: {
    grade: string;
    count: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'staff';
  department?: string;
}

export interface DbStatus {
  connected: boolean;
  mode: 'mongodb' | 'file-store';
  databaseName: string;
  host?: string;
  collections: {
    students: number;
    subjects: number;
    marks: number;
  };
  lastSyncedAt?: string;
}
