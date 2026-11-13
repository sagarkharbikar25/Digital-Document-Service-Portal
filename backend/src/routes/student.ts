import { Router, Request, Response } from 'express';
import { studentService } from '../services/StudentService.js';
import { fileUploadService } from '../services/FileUploadService.js';

export const studentRouter = Router();

/* ── GET /api/student/profile ── */
studentRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req.query.user_id as string) || '131', 10);
    const profile = await studentService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    return res.json({ success: true, data: profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/student/profile/update ── */
studentRouter.post('/profile/update', async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req.body.user_id as string) || '131', 10);
    const result = await studentService.updateProfile(userId, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/student/dashboard ── */
studentRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      stats: {
        active_applications: 2,
        ready_to_download: 1,
        total_certificates: 3,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/student/documents ── */
studentRouter.get('/documents', async (req: Request, res: Response) => {
  try {
    const appId = parseInt((req.query.application_id as string) || '0', 10);
    const docs = appId ? await fileUploadService.getDocuments(appId) : [];
    return res.json({ success: true, data: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
