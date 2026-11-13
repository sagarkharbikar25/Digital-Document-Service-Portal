import { query } from '../lib/db.js';

export class StudentService {
  public async getProfile(userId: number) {
    const res = await query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.branch, u.year,
              COALESCE(s.roll_number, u.bt_id) as roll_number,
              COALESCE(s.bt_id, u.bt_id) as bt_id,
              s.current_year, s.semester, s.admission_year, s.section,
              s.category, s.phone, s.dob, s.address, s.parent_name, s.parent_mobile
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       WHERE u.id = $1 LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  public async updateProfile(userId: number, data: Record<string, any>) {
    await query(
      `UPDATE users
       SET phone = COALESCE($2, phone),
           address = COALESCE($3, address)
       WHERE id = $1`,
      [userId, data.phone || null, data.address || null]
    );

    await query(
      `UPDATE students
       SET phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           parent_name = COALESCE($4, parent_name),
           parent_mobile = COALESCE($5, parent_mobile)
       WHERE user_id = $1`,
      [userId, data.phone || null, data.address || null, data.parent_name || null, data.parent_mobile || null]
    );

    return { success: true, message: 'Profile updated successfully' };
  }
}

export const studentService = new StudentService();

