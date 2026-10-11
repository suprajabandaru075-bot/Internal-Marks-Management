import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute dashboard analytics.',
    });
  }
});

export default router;
