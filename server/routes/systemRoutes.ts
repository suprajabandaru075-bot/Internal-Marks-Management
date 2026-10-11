import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

// GET /api/db/status
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = db.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get DB status' });
  }
});

// POST /api/db/seed - re-seed defaults
router.post('/seed', (req: Request, res: Response) => {
  try {
    db.resetToDefaults();
    res.json({
      success: true,
      message: 'Database reset to default seed records successfully.',
      data: db.getStatus(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to seed database' });
  }
});

// GET /api/db/export - download full JSON backup
router.get('/export', (req: Request, res: Response) => {
  try {
    const data = db.exportData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bytexl_academic_backup.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to export database' });
  }
});

// POST /api/db/import - upload JSON backup
router.post('/import', (req: Request, res: Response) => {
  try {
    const { backup } = req.body;
    if (!backup) {
      return res.status(400).json({ success: false, message: 'Missing backup data payload.' });
    }
    const status = db.importData(backup);
    res.json({
      success: true,
      message: 'Database restored successfully from backup.',
      data: status,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to restore backup' });
  }
});

// POST /api/auth/login - simple faculty/admin session login
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Demo user authentication
  const user = {
    id: 'usr-' + Date.now(),
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email: email.trim().toLowerCase(),
    role: role || (email.includes('admin') ? 'admin' : 'faculty'),
    department: 'Computer Science & Engineering',
    token: 'jwt-token-demo-' + Math.random().toString(36).substring(2),
  };

  res.json({
    success: true,
    message: 'Authentication successful.',
    user,
  });
});

export default router;
