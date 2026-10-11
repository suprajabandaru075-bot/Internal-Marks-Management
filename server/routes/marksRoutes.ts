import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

// GET /api/marks
router.get('/', (req: Request, res: Response) => {
  try {
    let list = db.getAllMarks();
    const { studentId, subjectId, department, assessmentName, search, grade } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.studentName?.toLowerCase().includes(q) ||
          m.rollNumber?.toLowerCase().includes(q) ||
          m.subjectName?.toLowerCase().includes(q) ||
          m.subjectCode?.toLowerCase().includes(q)
      );
    }

    if (studentId && typeof studentId === 'string' && studentId !== 'ALL') {
      list = list.filter((m) => m.studentId === studentId);
    }

    if (subjectId && typeof subjectId === 'string' && subjectId !== 'ALL') {
      list = list.filter((m) => m.subjectId === subjectId);
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      list = list.filter((m) => m.department === department);
    }

    if (assessmentName && typeof assessmentName === 'string' && assessmentName !== 'ALL') {
      list = list.filter((m) => m.assessmentName === assessmentName);
    }

    if (grade && typeof grade === 'string' && grade !== 'ALL') {
      list = list.filter((m) => m.grade === grade);
    }

    res.json({
      success: true,
      data: list,
      total: list.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch marks.' });
  }
});

// GET /api/marks/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const mark = db.getMarkById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Marks entry not found.' });
    }
    res.json({ success: true, data: mark });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch mark.' });
  }
});

// POST /api/marks
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      studentId,
      subjectId,
      assessmentName,
      maxMarks,
      marksObtained,
      assessmentDate,
      remarks,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student selection is required.' });
    }
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject selection is required.' });
    }
    if (!assessmentName || !assessmentName.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment Name is required.' });
    }
    if (maxMarks === undefined || maxMarks === null || isNaN(Number(maxMarks))) {
      return res.status(400).json({ success: false, message: 'Valid Maximum Marks is required.' });
    }
    if (marksObtained === undefined || marksObtained === null || isNaN(Number(marksObtained))) {
      return res.status(400).json({ success: false, message: 'Valid Marks Obtained is required.' });
    }

    const created = db.createMark({
      studentId,
      subjectId,
      assessmentName,
      maxMarks: Number(maxMarks),
      marksObtained: Number(marksObtained),
      assessmentDate,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: `Marks recorded successfully for ${created.studentName} (${created.marksObtained}/${created.maxMarks}).`,
      data: created,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to record marks.' });
  }
});

// PUT /api/marks/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateMark(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Marks entry updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update marks.' });
  }
});

// DELETE /api/marks/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteMark(req.params.id);
    res.json({
      success: true,
      message: `Marks entry for ${deleted.studentName} (${deleted.assessmentName}) deleted successfully.`,
      data: deleted,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete marks entry.' });
  }
});

export default router;
