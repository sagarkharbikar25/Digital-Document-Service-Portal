import { Router, Request, Response } from 'express';
import { notificationService } from '../services/NotificationService.js';

export const notificationsRouter = Router();

/* ── GET /api/notifications/my ── */
notificationsRouter.get(['/my', '/'], async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req.query.user_id as string) || '131', 10);
    const notifications = await notificationService.getUserNotifications(userId);
    return res.json({ success: true, data: notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/notifications/unread-count ── */
notificationsRouter.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req.query.user_id as string) || '131', 10);
    const count = await notificationService.getUnreadCount(userId);
    return res.json({ success: true, count });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/notifications/mark-read ── */
notificationsRouter.post('/mark-read', async (req: Request, res: Response) => {
  try {
    const id = parseInt((req.body.id || req.body.notification_id) as string, 10);
    const userId = parseInt((req.body.user_id as string) || '131', 10);
    await notificationService.markAsRead(id, userId);
    return res.json({ success: true, message: 'Marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/notifications/mark-all-read ── */
notificationsRouter.post('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req.body.user_id as string) || '131', 10);
    await notificationService.markAllAsRead(userId);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
