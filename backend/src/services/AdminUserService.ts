import { query } from '../lib/db.js';

export class AdminUserService {
  public async getStaffList(department?: string) {
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.created_at,
             s.designation
      FROM users u
      LEFT JOIN staff s ON s.user_id = u.id
      WHERE u.role IN ('clerk', 'hod', 'principal', 'admin')
    `;
    const params: any[] = [];
    if (department && department !== 'all') {
      sql += ` AND u.department ILIKE $1 `;
      params.push(`%${department}%`);
    }
    sql += ` ORDER BY u.role, u.department `;

    const res = await query(sql, params);
    return res.rows;
  }

  public async getStudentsList(department?: string, year?: string) {
    let sql = `
      SELECT u.id, u.name, u.email, u.department, u.branch, u.year,
             s.roll_number, s.bt_id, s.current_year, s.admission_year, s.phone
      FROM users u
      JOIN students s ON s.user_id = u.id
      WHERE u.role = 'student'
    `;
    const params: any[] = [];
    let idx = 1;
    if (department && department !== 'all') {
      sql += ` AND (u.department ILIKE $${idx} OR s.department ILIKE $${idx}) `;
      params.push(`%${department}%`);
      idx++;
    }
    if (year && year !== 'all') {
      sql += ` AND (u.year ILIKE $${idx} OR s.current_year ILIKE $${idx}) `;
      params.push(`%${year}%`);
      idx++;
    }
    sql += ` ORDER BY s.bt_id ASC LIMIT 200 `;

    const res = await query(sql, params);
    return res.rows;
  }
}

export const adminUserService = new AdminUserService();

