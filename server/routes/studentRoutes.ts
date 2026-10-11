import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

// GET /api/students - list with search, filter, pagination
router.get('/', (req: Request, res: Response) => {
  try {
    let list = db.getAllStudents();
    const { search, department, academicYear, page, limit } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      list = list.filter((s) => s.department === department);
    }

    if (academicYear && typeof academicYear === 'string' && academicYear !== 'ALL') {
      list = list.filter((s) => s.academicYear === academicYear);
    }

    const totalCount = list.length;
    const pageNum = page ? Math.max(1, parseInt(page as string, 10)) : 1;
    const pageSize = limit ? Math.max(1, parseInt(limit as string, 10)) : 50;

    const startIndex = (pageNum - 1) * pageSize;
    const paginated = list.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      data: paginated,
      total: totalCount,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch students' });
  }
});

// GET /api/students/:id - get single student with marks breakdown
router.get('/:id', (req: Request, res: Response) => {
  try {
    const student = db.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Attach student marks
    const allMarks = db.getAllMarks();
    const studentMarks = allMarks.filter((m) => m.studentId === student._id);

    res.json({
      success: true,
      data: {
        ...student,
        marks: studentMarks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch student details' });
  }
});

// POST /api/students - create student
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, rollNumber, department, academicYear, email, phone, semester, section } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student Name is required.' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Roll Number is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }
    if (!academicYear || !academicYear.trim()) {
      return res.status(400).json({ success: false, message: 'Academic Year is required.' });
    }

    const created = db.createStudent({
      name,
      rollNumber,
      department,
      academicYear,
      email,
      phone,
      semester,
      section,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: created,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to register student.' });
  }
});

// PUT /api/students/:id - update student
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Student record updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update student.' });
  }
});

// DELETE /api/students/:id - delete student
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteStudent(req.params.id);
    res.json({
      success: true,
      message: `Student "${deleted.name}" (${deleted.rollNumber}) deleted successfully.`,
      data: deleted,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete student.' });
  }
});

export default router;
