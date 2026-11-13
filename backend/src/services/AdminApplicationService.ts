import { query } from '../lib/db.js';

export class AdminApplicationService {
  public async getAllApplications(filters: {
    department?: string;
    status?: string;
    certificate_type?: string;
    search?: string;
  }) {
    let sql = `
      SELECT a.*,
             COALESCE(u.name, a.full_name) as student_name,
             COALESCE(u.email, a.email) as student_email,
             COALESCE(s.bt_id, a.btid) as bt_id,
             COALESCE(c.certificate_number, a.certificate_number) as cert_no
      FROM applications a
      LEFT JOIN users u ON u.id = a.student_id
      LEFT JOIN students s ON s.user_id = a.student_id
      LEFT JOIN certificates c ON c.application_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters.department && filters.department !== 'all') {
      sql += ` AND (a.branch ILIKE $${idx} OR s.department ILIKE $${idx}) `;
      params.push(`%${filters.department}%`);
      idx++;
    }

    if (filters.status && filters.status !== 'all') {
      sql += ` AND a.status = $${idx} `;
      params.push(filters.status);
      idx++;
    }

    if (filters.certificate_type && filters.certificate_type !== 'all') {
      sql += ` AND a.certificate_type = $${idx} `;
      params.push(filters.certificate_type);
      idx++;
    }

    if (filters.search) {
      sql += ` AND (a.application_number ILIKE $${idx} OR a.full_name ILIKE $${idx} OR a.btid ILIKE $${idx}) `;
      params.push(`%${filters.search}%`);
      idx++;
    }

    sql += ` ORDER BY a.created_at DESC `;
    const res = await query(sql, params);
    return res.rows;
  }
}

export const adminApplicationService = new AdminApplicationService();

