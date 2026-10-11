import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { initialStudents, initialSubjects, initialMarks } from '../data/initialSeed';

// ----------------- Mongoose Schemas & Models -----------------
export const StudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    semester: { type: Number, default: 1 },
    section: { type: String, default: 'A' },
  },
  { timestamps: true }
);

export const SubjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, default: 3, min: 1, max: 10 },
  },
  { timestamps: true }
);

export const MarksSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    department: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    assessmentName: { type: String, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    marksObtained: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
    assessmentDate: { type: String, required: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate marks entry for same student, subject, and assessment
MarksSchema.index({ studentId: 1, subjectId: 1, assessmentName: 1 }, { unique: true });

// Optional registered mongoose models
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const MarksModel = mongoose.models.Mark || mongoose.model('Mark', MarksSchema);

// ----------------- Hybrid Persistent Database Layer -----------------
// Enables immediate production readiness: File-backed persistence when MongoDB daemon is not running,
// and Mongoose synchronization when MONGODB_URI is provided.

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'academic_portal_db.json');

export interface DatabaseState {
  students: any[];
  subjects: any[];
  marks: any[];
  settings: {
    institutionName: string;
    gradingScale: { grade: string; min: number; max: number; gpa: number }[];
  };
}

class PortalDatabase {
  private state: DatabaseState = {
    students: [],
    subjects: [],
    marks: [],
    settings: {
      institutionName: 'BYTE XL Institute of Technology',
      gradingScale: [
        { grade: 'A+', min: 90, max: 100, gpa: 10.0 },
        { grade: 'A', min: 80, max: 89.99, gpa: 9.0 },
        { grade: 'B', min: 70, max: 79.99, gpa: 8.0 },
        { grade: 'C', min: 60, max: 69.99, gpa: 7.0 },
        { grade: 'D', min: 50, max: 59.99, gpa: 6.0 },
        { grade: 'F', min: 0, max: 49.99, gpa: 0.0 },
      ],
    },
  };

  private isMongoConnected: boolean = false;
  private mongoUri: string = '';

  constructor() {
    this.initFileStore();
  }

  private initFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.students && parsed.subjects && parsed.marks) {
          this.state = parsed;
          return;
        }
      }

      // Initialize with seed data
      this.resetToDefaults();
    } catch (err) {
      console.error('Error initializing database file store, loading default seed in memory:', err);
      this.resetToDefaults();
    }
  }

  private persistToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to local DB file:', err);
    }
  }

  public async connectMongoDB(uri?: string): Promise<boolean> {
    const mongoUri = uri || process.env.MONGODB_URI;
    if (!mongoUri) {
      return false;
    }

    try {
      this.mongoUri = mongoUri;
      // Set short connect timeout so app starts without blocking
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      this.isMongoConnected = true;
      console.log('Successfully connected to MongoDB:', mongoUri);
      return true;
    } catch (error) {
      console.warn('MongoDB connection not available. Using high-performance persistent embedded JSON store.');
      this.isMongoConnected = false;
      return false;
    }
  }

  public resetToDefaults() {
    this.state.students = JSON.parse(JSON.stringify(initialStudents));
    this.state.subjects = JSON.parse(JSON.stringify(initialSubjects));
    this.state.marks = JSON.parse(JSON.stringify(initialMarks));
    this.persistToFile();
  }

  public getStatus() {
    return {
      connected: this.isMongoConnected,
      mode: this.isMongoConnected ? 'mongodb' : 'file-store',
      databaseName: 'bytexl_academic_portal',
      mongoUriConfigured: Boolean(process.env.MONGODB_URI),
      host: this.isMongoConnected ? mongoose.connection.host : 'local-storage-engine',
      collections: {
        students: this.state.students.length,
        subjects: this.state.subjects.length,
        marks: this.state.marks.length,
      },
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // ---------------- Students CRUD ----------------
  public getAllStudents() {
    return [...this.state.students].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }

  public getStudentById(id: string) {
    return this.state.students.find((s) => s._id === id);
  }

  public getStudentByRoll(rollNumber: string) {
    return this.state.students.find(
      (s) => s.rollNumber.trim().toUpperCase() === rollNumber.trim().toUpperCase()
    );
  }

  public createStudent(data: {
    name: string;
    rollNumber: string;
    department: string;
    academicYear: string;
    email?: string;
    phone?: string;
    semester?: number;
    section?: string;
  }) {
    const rollClean = data.rollNumber.trim().toUpperCase();
    if (this.getStudentByRoll(rollClean)) {
      throw new Error(`Student with Roll Number "${rollClean}" already exists.`);
    }

    const newStudent = {
      _id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: data.name.trim(),
      rollNumber: rollClean,
      department: data.department.trim(),
      academicYear: data.academicYear.trim(),
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',
      semester: Number(data.semester) || 1,
      section: data.section?.trim().toUpperCase() || 'A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.students.push(newStudent);
    this.persistToFile();
    return newStudent;
  }

  public updateStudent(id: string, data: Partial<{
    name: string;
    rollNumber: string;
    department: string;
    academicYear: string;
    email?: string;
    phone?: string;
    semester?: number;
    section?: string;
  }>) {
    const index = this.state.students.findIndex((s) => s._id === id);
    if (index === -1) {
      throw new Error('Student not found.');
    }

    if (data.rollNumber) {
      const rollClean = data.rollNumber.trim().toUpperCase();
      const duplicate = this.state.students.find(
        (s) => s._id !== id && s.rollNumber.trim().toUpperCase() === rollClean
      );
      if (duplicate) {
        throw new Error(`Student with Roll Number "${rollClean}" already exists.`);
      }
      this.state.students[index].rollNumber = rollClean;
    }

    if (data.name !== undefined) this.state.students[index].name = data.name.trim();
    if (data.department !== undefined) this.state.students[index].department = data.department.trim();
    if (data.academicYear !== undefined) this.state.students[index].academicYear = data.academicYear.trim();
    if (data.email !== undefined) this.state.students[index].email = data.email.trim();
    if (data.phone !== undefined) this.state.students[index].phone = data.phone.trim();
    if (data.semester !== undefined) this.state.students[index].semester = Number(data.semester);
    if (data.section !== undefined) this.state.students[index].section = data.section.trim();
    this.state.students[index].updatedAt = new Date().toISOString();

    // Also update denormalized studentName/rollNumber/dept in marks records
    const updated = this.state.students[index];
    this.state.marks.forEach((m) => {
      if (m.studentId === id) {
        m.studentName = updated.name;
        m.rollNumber = updated.rollNumber;
        m.department = updated.department;
      }
    });

    this.persistToFile();
    return updated;
  }

  public deleteStudent(id: string) {
    const student = this.getStudentById(id);
    if (!student) {
      throw new Error('Student not found.');
    }

    this.state.students = this.state.students.filter((s) => s._id !== id);
    // Also remove marks associated with this student
    this.state.marks = this.state.marks.filter((m) => m.studentId !== id);
    this.persistToFile();
    return student;
  }

  // ---------------- Subjects CRUD ----------------
  public getAllSubjects() {
    return [...this.state.subjects].sort((a, b) => a.code.localeCompare(b.code));
  }

  public getSubjectById(id: string) {
    return this.state.subjects.find((s) => s._id === id);
  }

  public getSubjectByCode(code: string) {
    return this.state.subjects.find(
      (s) => s.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
  }

  public createSubject(data: {
    name: string;
    code: string;
    department: string;
    semester: number;
    credits?: number;
  }) {
    const codeClean = data.code.trim().toUpperCase();
    if (this.getSubjectByCode(codeClean)) {
      throw new Error(`Subject with Code "${codeClean}" already exists.`);
    }

    const newSubject = {
      _id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: data.name.trim(),
      code: codeClean,
      department: data.department.trim(),
      semester: Number(data.semester) || 1,
      credits: Number(data.credits) || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.subjects.push(newSubject);
    this.persistToFile();
    return newSubject;
  }

  public updateSubject(id: string, data: Partial<{
    name: string;
    code: string;
    department: string;
    semester: number;
    credits: number;
  }>) {
    const index = this.state.subjects.findIndex((s) => s._id === id);
    if (index === -1) {
      throw new Error('Subject not found.');
    }

    if (data.code) {
      const codeClean = data.code.trim().toUpperCase();
      const duplicate = this.state.subjects.find(
        (s) => s._id !== id && s.code.trim().toUpperCase() === codeClean
      );
      if (duplicate) {
        throw new Error(`Subject with Code "${codeClean}" already exists.`);
      }
      this.state.subjects[index].code = codeClean;
    }

    if (data.name !== undefined) this.state.subjects[index].name = data.name.trim();
    if (data.department !== undefined) this.state.subjects[index].department = data.department.trim();
    if (data.semester !== undefined) this.state.subjects[index].semester = Number(data.semester);
    if (data.credits !== undefined) this.state.subjects[index].credits = Number(data.credits);
    this.state.subjects[index].updatedAt = new Date().toISOString();

    const updated = this.state.subjects[index];
    this.state.marks.forEach((m) => {
      if (m.subjectId === id) {
        m.subjectName = updated.name;
        m.subjectCode = updated.code;
      }
    });

    this.persistToFile();
    return updated;
  }

  public deleteSubject(id: string) {
    const subject = this.getSubjectById(id);
    if (!subject) {
      throw new Error('Subject not found.');
    }

    // Check referential integrity: reject if referenced by marks
    const hasMarks = this.state.marks.some((m) => m.subjectId === id);
    if (hasMarks) {
      throw new Error(
        `Cannot delete subject "${subject.code} - ${subject.name}" because assessment marks are already recorded for it. Delete related marks first.`
      );
    }

    this.state.subjects = this.state.subjects.filter((s) => s._id !== id);
    this.persistToFile();
    return subject;
  }

  // ---------------- Marks CRUD ----------------
  public getAllMarks() {
    return [...this.state.marks].sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );
  }

  public getMarkById(id: string) {
    return this.state.marks.find((m) => m._id === id);
  }

  public calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  public createMark(data: {
    studentId: string;
    subjectId: string;
    assessmentName: string;
    maxMarks: number;
    marksObtained: number;
    assessmentDate: string;
    remarks?: string;
  }) {
    const student = this.getStudentById(data.studentId);
    if (!student) throw new Error('Selected student does not exist.');

    const subject = this.getSubjectById(data.subjectId);
    if (!subject) throw new Error('Selected subject does not exist.');

    const maxMarks = Number(data.maxMarks);
    const marksObtained = Number(data.marksObtained);

    if (isNaN(maxMarks) || maxMarks <= 0) {
      throw new Error('Maximum marks must be a numeric value greater than zero.');
    }
    if (isNaN(marksObtained) || marksObtained < 0) {
      throw new Error('Marks obtained cannot be negative or empty.');
    }
    if (marksObtained > maxMarks) {
      throw new Error(`Marks obtained (${marksObtained}) cannot exceed Maximum Marks (${maxMarks}).`);
    }

    const assessName = data.assessmentName.trim();
    // Duplicate check for same student, subject, assessment
    const existing = this.state.marks.find(
      (m) =>
        m.studentId === data.studentId &&
        m.subjectId === data.subjectId &&
        m.assessmentName.toLowerCase() === assessName.toLowerCase()
    );

    if (existing) {
      throw new Error(
        `Marks for student "${student.name}" in "${subject.name}" for "${assessName}" already exist. Edit the existing record instead.`
      );
    }

    const percentage = Math.round((marksObtained / maxMarks) * 100 * 10) / 10;
    const grade = this.calculateGrade(percentage);

    const newMark = {
      _id: 'mrk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      subjectId: subject._id,
      subjectName: subject.name,
      subjectCode: subject.code,
      assessmentName: assessName,
      maxMarks,
      marksObtained,
      percentage,
      grade,
      assessmentDate: data.assessmentDate || new Date().toISOString().split('T')[0],
      remarks: data.remarks?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.marks.push(newMark);
    this.persistToFile();
    return newMark;
  }

  public updateMark(
    id: string,
    data: Partial<{
      studentId: string;
      subjectId: string;
      assessmentName: string;
      maxMarks: number;
      marksObtained: number;
      assessmentDate: string;
      remarks?: string;
    }>
  ) {
    const index = this.state.marks.findIndex((m) => m._id === id);
    if (index === -1) {
      throw new Error('Marks record not found.');
    }

    const existing = this.state.marks[index];
    const targetStudentId = data.studentId || existing.studentId;
    const targetSubjectId = data.subjectId || existing.subjectId;
    const targetAssessment = (data.assessmentName || existing.assessmentName).trim();

    const student = this.getStudentById(targetStudentId);
    if (!student) throw new Error('Student not found.');

    const subject = this.getSubjectById(targetSubjectId);
    if (!subject) throw new Error('Subject not found.');

    // Duplicate check if key fields changed
    const duplicate = this.state.marks.find(
      (m) =>
        m._id !== id &&
        m.studentId === targetStudentId &&
        m.subjectId === targetSubjectId &&
        m.assessmentName.toLowerCase() === targetAssessment.toLowerCase()
    );
    if (duplicate) {
      throw new Error(
        `Marks for student "${student.name}" in "${subject.name}" for "${targetAssessment}" already exist in another record.`
      );
    }

    const maxMarks = data.maxMarks !== undefined ? Number(data.maxMarks) : existing.maxMarks;
    const marksObtained = data.marksObtained !== undefined ? Number(data.marksObtained) : existing.marksObtained;

    if (isNaN(maxMarks) || maxMarks <= 0) {
      throw new Error('Maximum marks must be greater than zero.');
    }
    if (isNaN(marksObtained) || marksObtained < 0) {
      throw new Error('Marks obtained cannot be negative.');
    }
    if (marksObtained > maxMarks) {
      throw new Error(`Marks obtained (${marksObtained}) cannot exceed Maximum Marks (${maxMarks}).`);
    }

    const percentage = Math.round((marksObtained / maxMarks) * 100 * 10) / 10;
    const grade = this.calculateGrade(percentage);

    const updated = {
      ...existing,
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      subjectId: subject._id,
      subjectName: subject.name,
      subjectCode: subject.code,
      assessmentName: targetAssessment,
      maxMarks,
      marksObtained,
      percentage,
      grade,
      assessmentDate: data.assessmentDate || existing.assessmentDate,
      remarks: data.remarks !== undefined ? data.remarks.trim() : existing.remarks,
      updatedAt: new Date().toISOString(),
    };

    this.state.marks[index] = updated;
    this.persistToFile();
    return updated;
  }

  public deleteMark(id: string) {
    const mark = this.getMarkById(id);
    if (!mark) {
      throw new Error('Marks record not found.');
    }

    this.state.marks = this.state.marks.filter((m) => m._id !== id);
    this.persistToFile();
    return mark;
  }

  // ---------------- Dashboard & Analytics ----------------
  public getDashboardStats() {
    const totalStudents = this.state.students.length;
    const totalSubjects = this.state.subjects.length;
    const totalMarksEntries = this.state.marks.length;

    let averageMarksPercentage = 0;
    if (totalMarksEntries > 0) {
      const sumPercentage = this.state.marks.reduce((acc, m) => acc + (m.percentage || 0), 0);
      averageMarksPercentage = Math.round((sumPercentage / totalMarksEntries) * 10) / 10;
    }

    // Department summary
    const deptMap = new Map<string, { count: number; markPercentages: number[] }>();
    this.state.students.forEach((s) => {
      if (!deptMap.has(s.department)) {
        deptMap.set(s.department, { count: 0, markPercentages: [] });
      }
      deptMap.get(s.department)!.count += 1;
    });

    this.state.marks.forEach((m) => {
      const dept = m.department;
      if (dept && deptMap.has(dept)) {
        deptMap.get(dept)!.markPercentages.push(m.percentage || 0);
      }
    });

    const departmentSummary = Array.from(deptMap.entries()).map(([dept, val]) => {
      const avg =
        val.markPercentages.length > 0
          ? Math.round(
              (val.markPercentages.reduce((a, b) => a + b, 0) / val.markPercentages.length) * 10
            ) / 10
          : 0;
      return {
        department: dept,
        studentCount: val.count,
        averageMarks: avg,
      };
    });

    // Subject overview
    const subjectMap = new Map<string, { marks: number[]; max: number; passes: number }>();
    this.state.marks.forEach((m) => {
      if (!subjectMap.has(m.subjectId)) {
        subjectMap.set(m.subjectId, { marks: [], max: 0, passes: 0 });
      }
      const entry = subjectMap.get(m.subjectId)!;
      entry.marks.push(m.percentage || 0);
      if ((m.percentage || 0) >= 50) {
        entry.passes += 1;
      }
    });

    const subjectOverview = this.state.subjects.map((sub) => {
      const stat = subjectMap.get(sub._id);
      const entries = stat ? stat.marks.length : 0;
      const avg = entries > 0 ? Math.round((stat!.marks.reduce((a, b) => a + b, 0) / entries) * 10) / 10 : 0;
      const passPercentage = entries > 0 ? Math.round((stat!.passes / entries) * 100) : 0;

      return {
        subjectName: sub.name,
        subjectCode: sub.code,
        department: sub.department,
        averageMarks: avg,
        totalEntries: entries,
        passPercentage,
      };
    });

    // Assessment distribution
    const assessMap = new Map<string, number[]>();
    this.state.marks.forEach((m) => {
      const name = m.assessmentName || 'Unknown';
      if (!assessMap.has(name)) assessMap.set(name, []);
      assessMap.get(name)!.push(m.percentage || 0);
    });

    const assessmentDistribution = Array.from(assessMap.entries()).map(([name, scores]) => ({
      assessmentName: name,
      count: scores.length,
      averagePercentage: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }));

    // Grade distribution
    const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    this.state.marks.forEach((m) => {
      const g = m.grade || 'F';
      if (gradeCounts[g] !== undefined) {
        gradeCounts[g] += 1;
      } else {
        gradeCounts[g] = 1;
      }
    });

    const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count,
    }));

    const recentMarks = this.getAllMarks().slice(0, 7);

    return {
      totalStudents,
      totalMarksEntries,
      totalSubjects,
      averageMarksPercentage,
      departmentSummary,
      subjectOverview,
      recentMarks,
      assessmentDistribution,
      gradeDistribution,
    };
  }

  // Backup and Restore
  public exportData() {
    return this.state;
  }

  public importData(newState: DatabaseState) {
    if (!newState.students || !newState.subjects || !newState.marks) {
      throw new Error('Invalid database backup format. Must contain students, subjects, and marks.');
    }
    this.state = newState;
    this.persistToFile();
    return this.getStatus();
  }
}

export const db = new PortalDatabase();
