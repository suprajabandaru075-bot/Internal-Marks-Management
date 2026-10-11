import { Student, Subject, Mark, DashboardStats, DbStatus, User } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text };
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Server error (${response.status}): ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to the backend server at ${url}. Please ensure the server is running.`);
      }
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await this.request<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return res.data;
  }

  // Students
  async getStudents(params?: {
    search?: string;
    department?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Student[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department && params.department !== 'ALL') query.append('department', params.department);
    if (params?.academicYear && params.academicYear !== 'ALL') query.append('academicYear', params.academicYear);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await this.request<{
      success: boolean;
      data: Student[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/students?${query.toString()}`);
    return res;
  }

  async getStudentById(id: string): Promise<Student & { marks: Mark[] }> {
    const res = await this.request<{ success: boolean; data: Student & { marks: Mark[] } }>(`/students/${id}`);
    return res.data;
  }

  async createStudent(student: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    return res.data;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
    return res.data;
  }

  async deleteStudent(id: string): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>(`/students/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // Subjects
  async getSubjects(params?: { department?: string; semester?: string; search?: string }): Promise<Subject[]> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'ALL') query.append('department', params.department);
    if (params?.semester && params.semester !== 'ALL') query.append('semester', params.semester);
    if (params?.search) query.append('search', params.search);

    const res = await this.request<{ success: boolean; data: Subject[] }>(`/subjects?${query.toString()}`);
    return res.data;
  }

  async createSubject(subject: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    const res = await this.request<{ success: boolean; data: Subject; message: string }>('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
    return res.data;
  }

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    const res = await this.request<{ success: boolean; data: Subject; message: string }>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
    return res.data;
  }

  async deleteSubject(id: string): Promise<Subject> {
    const res = await this.request<{ success: boolean; data: Subject; message: string }>(`/subjects/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // Marks
  async getMarks(params?: {
    studentId?: string;
    subjectId?: string;
    department?: string;
    assessmentName?: string;
    grade?: string;
    search?: string;
  }): Promise<Mark[]> {
    const query = new URLSearchParams();
    if (params?.studentId && params.studentId !== 'ALL') query.append('studentId', params.studentId);
    if (params?.subjectId && params.subjectId !== 'ALL') query.append('subjectId', params.subjectId);
    if (params?.department && params.department !== 'ALL') query.append('department', params.department);
    if (params?.assessmentName && params.assessmentName !== 'ALL') query.append('assessmentName', params.assessmentName);
    if (params?.grade && params.grade !== 'ALL') query.append('grade', params.grade);
    if (params?.search) query.append('search', params.search);

    const res = await this.request<{ success: boolean; data: Mark[] }>(`/marks?${query.toString()}`);
    return res.data;
  }

  async getMarkById(id: string): Promise<Mark> {
    const res = await this.request<{ success: boolean; data: Mark }>(`/marks/${id}`);
    return res.data;
  }

  async createMark(mark: {
    studentId: string;
    subjectId: string;
    assessmentName: string;
    maxMarks: number;
    marksObtained: number;
    assessmentDate?: string;
    remarks?: string;
  }): Promise<Mark> {
    const res = await this.request<{ success: boolean; data: Mark; message: string }>('/marks', {
      method: 'POST',
      body: JSON.stringify(mark),
    });
    return res.data;
  }

  async updateMark(id: string, mark: Partial<Mark>): Promise<Mark> {
    const res = await this.request<{ success: boolean; data: Mark; message: string }>(`/marks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mark),
    });
    return res.data;
  }

  async deleteMark(id: string): Promise<Mark> {
    const res = await this.request<{ success: boolean; data: Mark; message: string }>(`/marks/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // System & DB
  async getDbStatus(): Promise<DbStatus> {
    const res = await this.request<{ success: boolean; data: DbStatus }>('/db/status');
    return res.data;
  }

  async resetDbSeed(): Promise<DbStatus> {
    const res = await this.request<{ success: boolean; data: DbStatus; message: string }>('/db/seed', {
      method: 'POST',
    });
    return res.data;
  }

  async exportDatabase(): Promise<any> {
    const res = await this.request<any>('/db/export');
    return res;
  }

  async importDatabase(backup: any): Promise<DbStatus> {
    const res = await this.request<{ success: boolean; data: DbStatus; message: string }>('/db/import', {
      method: 'POST',
      body: JSON.stringify({ backup }),
    });
    return res.data;
  }

  async login(credentials: { email: string; password: string; role?: string }): Promise<{ user: User }> {
    const res = await this.request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return res;
  }
}

export const api = new ApiService();
