import { Router, Request, Response } from 'express';
import { approvalService } from '../services/ApprovalService.js';
import { adminDashboardService } from '../services/AdminDashboardService.js';

export const approvalsRouter = Router();

/* ── CLERK ENDPOINTS ── */
approvalsRouter.get('/clerk-pending', async (req: Request, res: Response) => {
  try {
    const dept = (req.query.department || req.headers['x-department'] || '') as string;
    const data = await approvalService.getClerkPending(dept);
    return res.json({ success: true, data, filtered_by_department: dept || 'all' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post('/clerk-approve', async (req: Request, res: Response) => {
  try {
    const { application_id, remarks } = req.body;
    const result = await approvalService.clerkApprove(application_id, 1, remarks);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post('/clerk-reject', async (req: Request, res: Response) => {
  try {
    const { application_id, reason } = req.body;
    const result = await approvalService.clerkReject(application_id, 1, reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── HOD ENDPOINTS ── */
approvalsRouter.get('/hod-pending', async (req: Request, res: Response) => {
  try {
    const dept = (req.query.department || req.headers['x-department'] || '') as string;
    const data = await approvalService.getHodPending(dept);
    return res.json({ success: true, data, filtered_by_department: dept || 'all' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post(['/hod-approve', '/hodApprove'], async (req: Request, res: Response) => {
  try {
    const { application_id, remarks } = req.body;
    const result = await approvalService.hodApprove(application_id, 2, remarks);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post(['/hod-reject', '/hodReject'], async (req: Request, res: Response) => {
  try {
    const { application_id, reason } = req.body;
    const result = await approvalService.hodReject(application_id, 2, reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PRINCIPAL ENDPOINTS (Institutional) ── */
approvalsRouter.get('/principal-pending', async (req: Request, res: Response) => {
  try {
    const dept = (req.query.department || req.headers['x-department'] || '') as string;
    const data = await approvalService.getPrincipalPending(dept);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post(['/principal-approve-final', '/principal-approve', '/principalApprove'], async (req: Request, res: Response) => {
  try {
    const { application_id, remarks } = req.body;
    const result = await approvalService.principalApproveFinal(application_id, 3, remarks);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.post(['/principal-reject', '/principalReject'], async (req: Request, res: Response) => {
  try {
    const { application_id, reason } = req.body;
    const result = await approvalService.principalReject(application_id, 3, reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── ADMIN STATS ── */
approvalsRouter.get(['/stats', '/dashboardStats'], async (req: Request, res: Response) => {
  try {
    const dept = (req.query.department || '') as string;
    const stats = await adminDashboardService.getStats(dept);
    return res.json({ success: true, stats, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

approvalsRouter.get('/pendingCount', async (req: Request, res: Response) => {
  try {
    const dept = (req.query.department || '') as string;
    const stats = await adminDashboardService.getStats(dept);
    return res.json({
      success: true,
      pending: stats.pending_clerk + stats.pending_hod + stats.pending_principal,
      clerk: stats.pending_clerk,
      hod: stats.pending_hod,
      principal: stats.pending_principal,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
