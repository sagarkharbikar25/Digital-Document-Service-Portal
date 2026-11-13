import { query } from '../lib/db.js';

export class AdminCertificateService {
  public async searchCertificates(queryStr: string) {
    const res = await query(
      `SELECT c.*, a.full_name, a.btid, a.certificate_type, a.status,
              u.name as student_name, u.email as student_email
       FROM certificates c
       JOIN applications a ON a.id = c.application_id
       LEFT JOIN users u ON u.id = a.student_id
       WHERE c.certificate_number ILIKE $1 OR a.btid ILIKE $1 OR a.full_name ILIKE $1
       ORDER BY c.generated_at DESC`,
      [`%${queryStr}%`]
    );
    return res.rows;
  }

  public async getAllCertificates(limit: number = 100) {
    const res = await query(
      `SELECT c.*, a.full_name, a.btid, a.certificate_type, a.status
       FROM certificates c
       JOIN applications a ON a.id = c.application_id
       ORDER BY c.generated_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }
}

export const adminCertificateService = new AdminCertificateService();

