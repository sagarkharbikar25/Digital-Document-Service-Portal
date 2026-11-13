import { query } from '../lib/db.js';

export class AdminLogService {
  public async logAction(applicationId: number, userId: number, role: string, action: string, remark: string) {
    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [applicationId, userId, role, action, remark]
    ).catch(() => {});
  }

  public async getAuditLogs(applicationId?: number, limit: number = 100) {
    let sql = `
      SELECT r.*, u.name as user_name, u.email as user_email, a.application_number
      FROM application_remarks r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN applications a ON a.id = r.application_id
    `;
    const params: any[] = [];
    if (applicationId) {
      sql += ` WHERE r.application_id = $1 `;
      params.push(applicationId);
    }
    sql += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} `;
    params.push(limit);

    const res = await query(sql, params).catch(() => ({ rows: [] }));
    return res.rows;
  }
}

export const adminLogService = new AdminLogService();

