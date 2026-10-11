import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

// GET /api/subjects
router.get('/', (req: Request, res: Response) => {
  try {
    let list = db.getAllSubjects();
    const { department, semester, search } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      list = list.filter((s) => s.department === department);
    }

    if (semester && typeof semester === 'string' && semester !== 'ALL') {
      const semNum = parseInt(semester, 10);
      list = list.filter((s) => s.semester === semNum);
    }

    res.json({
      success: true,
      data: list,
      total: list.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch subjects.' });
  }
});

// GET /api/subjects/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const subject = db.getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    res.json({ success: true, data: subject });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch subject.' });
  }
});

// POST /api/subjects
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, code, department, semester, credits } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject Name is required.' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Subject Code is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }
    if (semester === undefined || isNaN(Number(semester))) {
      return res.status(400).json({ success: false, message: 'Valid Semester is required.' });
    }

    const created = db.createSubject({
      name,
      code,
      department,
      semester: Number(semester),
      credits: Number(credits) || 3,
    });

    res.status(201).json({
      success: true,
      message: 'Subject added successfully.',
      data: created,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to add subject.' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateSubject(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Subject updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update subject.' });
  }
});

// DELETE /api/subjects/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteSubject(req.params.id);
    res.json({
      success: true,
      message: `Subject "${deleted.code} - ${deleted.name}" deleted successfully.`,
      data: deleted,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete subject.' });
  }
});

export default router;
