import { query } from '../lib/db.js';

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export class NotificationService {
  public async create(userId: number, title: string, message: string, type: string = 'status'): Promise<number> {
    const res = await query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id`,
      [userId, title, message, type]
    );
    return res.rows[0].id;
  }

  public async getUserNotifications(userId: number): Promise<NotificationItem[]> {
    const res = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  public async getUnreadCount(userId: number): Promise<number> {
    const res = await query(
      `SELECT COUNT(*)::int as count FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return res.rows[0]?.count || 0;
  }

  public async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    return true;
  }

  public async markAllAsRead(userId: number): Promise<boolean> {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return true;
  }
}

export const notificationService = new NotificationService();

