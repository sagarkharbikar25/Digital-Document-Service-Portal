import { query } from '../lib/db.js';
import { certificateService } from './CertificateService.js';
import { notificationService } from './NotificationService.js';

export class ApprovalService {
  /* ── 1. CLERK METHODS ── */
  public async getClerkPending(department?: string) {
    let sql = `
      SELECT a.*,
             COALESCE(u.name, a.full_name) as student_name,
             COALESCE(u.email, a.email) as student_email,
             COALESCE(s.bt_id, a.btid) as bt_id,
             COALESCE(a.branch, s.department, s.branch, 'N/A') as department,
             COALESCE(a.year, s.current_year, s.year, 'N/A') as year
      FROM applications a
      LEFT JOIN users u ON u.id = a.student_id
      LEFT JOIN students s ON s.user_id = a.student_id
      WHERE a.status IN ('pending', 'pending_clerk')
    `;
    const params: any[] = [];
    if (department && department !== 'all' && department !== 'All' && department !== 'Institution') {
      params.push(`%${department}%`);
      sql += ` AND (COALESCE(a.branch, s.department, s.branch, '') ILIKE $1 OR COALESCE(s.bt_id, a.btid, '') ILIKE $1) `;
    }
    sql += ` ORDER BY a.created_at ASC `;

    const res = await query(sql, params);
    return res.rows;
  }

  public async clerkApprove(applicationId: number, clerkId: number, remarks: string = 'Verified by Clerk') {
    await query(
      `UPDATE applications
       SET status = 'pending_hod', clerk_status = 'approved',
           clerk_id = $2, clerk_remarks = $3, clerk_approved_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [applicationId, clerkId, remarks]
    );

    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'clerk', 'approved', $3, NOW())`,
      [applicationId, clerkId, remarks]
    ).catch(() => {});

    return { success: true, message: 'Approved by Clerk and forwarded to HOD' };
  }

  public async clerkReject(applicationId: number, clerkId: number, reason: string) {
    await query(
      `UPDATE applications
       SET status = 'rejected', clerk_status = 'rejected',
           clerk_id = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $1`,
      [applicationId, clerkId, reason || 'Discrepancy in records']
    );

    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'clerk', 'rejected', $3, NOW())`,
      [applicationId, clerkId, reason]
    ).catch(() => {});

    return { success: true, message: 'Application rejected by Clerk' };
  }

  /* ── 2. HOD METHODS ── */
  public async getHodPending(department?: string) {
    let sql = `
      SELECT a.*,
             COALESCE(u.name, a.full_name) as student_name,
             COALESCE(u.email, a.email) as student_email,
             COALESCE(s.bt_id, a.btid) as bt_id,
             COALESCE(a.branch, s.department, s.branch, 'N/A') as department,
             COALESCE(a.year, s.current_year, s.year, 'N/A') as year
      FROM applications a
      LEFT JOIN users u ON u.id = a.student_id
      LEFT JOIN students s ON s.user_id = a.student_id
      WHERE (a.status = 'pending_hod' OR a.clerk_status = 'approved')
    `;
    const params: any[] = [];
    if (department && department !== 'all' && department !== 'All' && department !== 'Institution') {
      params.push(`%${department}%`);
      sql += ` AND (COALESCE(a.branch, s.department, s.branch, '') ILIKE $1 OR COALESCE(s.bt_id, a.btid, '') ILIKE $1) `;
    }
    sql += ` ORDER BY a.created_at ASC `;

    const res = await query(sql, params);
    return res.rows;
  }

  public async hodApprove(applicationId: number, hodId: number, remarks: string = 'Recommended by HOD') {
    await query(
      `UPDATE applications
       SET status = 'pending_principal', hod_status = 'approved',
           hod_id = $2, hod_remarks = $3, hod_approved_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [applicationId, hodId, remarks]
    );

    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'hod', 'approved', $3, NOW())`,
      [applicationId, hodId, remarks]
    ).catch(() => {});

    return { success: true, message: 'Recommended by HOD and forwarded to Principal' };
  }

  public async hodReject(applicationId: number, hodId: number, reason: string) {
    await query(
      `UPDATE applications
       SET status = 'rejected', hod_status = 'rejected',
           hod_id = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $1`,
      [applicationId, hodId, reason || 'Attendance criteria not fulfilled']
    );

    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'hod', 'rejected', $3, NOW())`,
      [applicationId, hodId, reason]
    ).catch(() => {});

    return { success: true, message: 'Application rejected by HOD' };
  }

  /* ── 3. PRINCIPAL METHODS (Institutional) ── */
  public async getPrincipalPending(department?: string) {
    let sql = `
      SELECT a.*,
             COALESCE(u.name, a.full_name) as student_name,
             COALESCE(u.email, a.email) as student_email,
             COALESCE(s.bt_id, a.btid) as bt_id,
             COALESCE(a.branch, s.department, s.branch, 'N/A') as department,
             COALESCE(a.year, s.current_year, s.year, 'N/A') as year
      FROM applications a
      LEFT JOIN users u ON u.id = a.student_id
      LEFT JOIN students s ON s.user_id = a.student_id
      WHERE a.status = 'pending_principal'
    `;
    const params: any[] = [];
    if (department && department !== 'all' && department !== 'All' && department !== 'Institution') {
      params.push(`%${department}%`);
      sql += ` AND (COALESCE(a.branch, s.department, s.branch, '') ILIKE $1 OR COALESCE(s.bt_id, a.btid, '') ILIKE $1) `;
    }
    sql += ` ORDER BY a.created_at ASC `;

    const res = await query(sql, params);
    return res.rows;
  }

  public async principalApproveFinal(applicationId: number, principalId: number, remarks: string = 'Sanctioned by Principal') {
    // Generate official certificate
    const certResult = await certificateService.generateCertificate(applicationId, principalId);

    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'principal', 'approved', $3, NOW())`,
      [applicationId, principalId, remarks]
    ).catch(() => {});

    // Notify student
    const app = await query('SELECT student_id, application_number FROM applications WHERE id = $1', [applicationId]);
    if (app.rows.length > 0) {
      await notificationService.create(
        app.rows[0].student_id,
        'Certificate Ready for Download',
        `Your certificate (${certResult.certificateNumber}) has been sanctioned and issued.`
      ).catch(() => {});
    }

    return {
      success: true,
      message: 'Cryptographically sanctioned and issued by Principal',
      certificate_number: certResult.certificateNumber,
      file_path: certResult.filePath,
      hash: certResult.hash
    };
  }

  public async principalReject(applicationId: number, principalId: number, reason: string) {
    await query(
      `UPDATE applications
       SET status = 'rejected', principal_status = 'rejected',
           principal_id = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $1`,
      [applicationId, principalId, reason || 'Institutional grounds']
    );

    return { success: true, message: 'Application rejected by Principal' };
  }
}

export const approvalService = new ApprovalService();

