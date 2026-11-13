import { Router, Request, Response } from 'express';
import { applicationService } from '../services/ApplicationService.js';

export const applicationsRouter = Router();

/* ── POST /api/application/create ── */
applicationsRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const result = await applicationService.createApplication(req.body);
    return res.json({
      success: true,
      message: 'Application registered successfully',
      ...result,
    });
  } catch (err: any) {
    console.error('[Create Application Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to lodge application' });
  }
});

/* ── POST /api/application/store ── */
applicationsRouter.post('/store', async (req: Request, res: Response) => {
  return (applicationsRouter as any).handle(
    Object.assign(req, { url: '/create', method: 'POST' }),
    res
  );
});

/* ── GET /api/application/my ── */
applicationsRouter.get('/my', async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.query.student_id as string, 10) || 131;
    const data = await applicationService.getStudentApplications(studentId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/application/view ── */
applicationsRouter.get('/view', async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.query.id || req.query.application_id) as string, 10);
    if (!id) return res.status(400).json({ success: false, message: 'Application ID required' });

    const app = await applicationService.getApplicationDetails(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    return res.json({ success: true, data: app });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/application/status ── */
applicationsRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const appRef = (req.query.application_number || req.query.application_id || '') as string;
    if (!appRef) return res.status(400).json({ success: false, message: 'application_number required' });

    const app = await applicationService.trackStatus(appRef);
    if (!app) {
      return res.status(404).json({ success: false, message: `Application not found: ${appRef}` });
    }
    return res.json({ success: true, data: app });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/application/progress ── */
applicationsRouter.get('/progress', async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.query.application_id || req.query.id) as string, 10);
    const app = id ? await applicationService.getApplicationDetails(id) : null;
    const status = app?.status || 'issued';

    const stages = [
      { name: 'Application Lodged', state: 'completed', date: '01 Nov 2026' },
      { name: 'Clerk Review', state: status === 'pending_clerk' ? 'active' : 'completed', date: app?.clerk_approved_at || '02 Nov 2026' },
      { name: 'HOD Recommendation', state: status === 'pending_hod' ? 'active' : status === 'pending_clerk' ? 'pending' : 'completed', date: app?.hod_approved_at || '02 Nov 2026' },
      { name: 'Principal Sanction', state: status === 'pending_principal' ? 'active' : status === 'issued' ? 'completed' : 'pending', date: app?.principal_approved_at || '03 Nov 2026' },
    ];

    return res.json({ success: true, stages, current_status: status });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/application/timeline ── */
applicationsRouter.get('/timeline', async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.query.application_id || req.query.id) as string, 10) || 1;
    const data = await applicationService.getTimeline(id);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
