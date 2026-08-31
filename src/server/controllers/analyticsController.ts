import { Request, Response } from 'express';
import { db } from '../db.js';

export const getAnalytics = (_req: Request, res: Response) => {
  try {
    const summary = db.getAnalytics();
    res.json({ success: true, analytics: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};
