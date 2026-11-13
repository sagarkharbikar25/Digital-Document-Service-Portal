import { query } from '../lib/db.js';
import { applicationNumberService } from './ApplicationNumberService.js';
import { notificationService } from './NotificationService.js';

export class ApplicationService {
  /**
   * Helper to parse branch and year from BT-ID if needed
   * e.g. BT240076CS -> Batch 2024, Computer Science and Engineering
   */
  public parseBtId(btid: string) {
    const clean = (btid || '').toUpperCase().trim();
    const match = clean.match(/^BT(\d{2})(\d{4})([A-Z]+)$/);
    if (!match) return null;

    const yy = parseInt(match[1], 10);
    const code = match[3];

    const branchMap: Record<string, string> = {
      CS: 'Computer Science and Engineering',
      CSE: 'Computer Science and Engineering',
      IT: 'Information Technology',
      AI: 'Artificial Intelligence',
      DS: 'Data Science',
      CY: 'Cyber Security',
      CYS: 'Cyber Security',
      ETC: 'Electronics & Telecommunication',
      EXTC: 'Electronics & Telecommunication',
      EE: 'Electrical Engineering',
      ME: 'Mechanical Engineering',
      CE: 'Civil Engineering',
      BSHD: 'Basic Science and Humanities (BSHD)',
    };

    return {
      admissionYear: 2000 + yy,
      branch: branchMap[code] || 'Engineering',
      roll: match[2],
      code,
    };
  }

  public async createApplication(data: Record<string, any>) {
    const studentId = data.student_id || 131;
    const certType = (data.certificate_type || data.admType || 'bonafide').toLowerCase();

    // Separate standard columns from dynamic form metadata
    const standardKeys = [
      'fullName', 'full_name', 'dob', 'gender', 'mobile', 'email',
      'btid', 'bt_id', 'branch', 'department', 'year', 'acYear', 'ac_year',
      'admType', 'adm_type', 'certificate_type', 'purpose', 'student_id',
      'feeType', 'fee_type', 'transactionId', 'transaction_id', 'amount'
    ];

    const metadata: Record<string, any> = { ...(data.metadata || {}) };
    for (const [key, val] of Object.entries(data)) {
      if (!standardKeys.includes(key)) {
        metadata[key] = val;
      }
    }

    const btid = data.btid || data.bt_id || 'BT240076CS';
    const parsedBt = this.parseBtId(btid);

    const branch = data.branch || data.department || parsedBt?.branch || 'Computer Science and Engineering';
    const year = data.year || 'Third Year';

    // Insert into applications
    const insertRes = await query(
      `INSERT INTO applications
       (student_id, full_name, dob, gender, mobile, email, btid, branch, year, ac_year,
        adm_type, certificate_type, purpose, fee_type, transaction_id, amount, metadata,
        application_number, status, clerk_status, hod_status, principal_status, created_at, updated_at)
       VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'TEMP', 'pending_clerk', 'pending', 'pending', 'pending', NOW(), NOW())
       RETURNING id`,
      [
        studentId,
        data.fullName || data.full_name || 'Akash Kumar',
        data.dob || null,
        data.gender || 'Male',
        data.mobile || '9876543210',
        data.email || 'student@jdcoem.ac.in',
        btid,
        branch,
        year,
        data.acYear || data.ac_year || '2025 – 2026',
        data.admType || certType,
        certType,
        data.purpose || 'Official Document Application',
        data.feeType || data.fee_type || null,
        data.transactionId || data.transaction_id || null,
        data.amount || null,
        JSON.stringify(metadata)
      ]
    );

    const appId = insertRes.rows[0].id;
    // Generate official sequential format APP-YYYY-000000
    const appNumber = await applicationNumberService.assign(appId);

    // Record submission remark
    await query(
      `INSERT INTO application_remarks (application_id, user_id, role, status, remark, created_at)
       VALUES ($1, $2, 'student', 'submitted', 'Application submitted by student', NOW())`,
      [appId, studentId]
    ).catch(() => {});

    // Notify student
    await notificationService.create(
      studentId,
      'Application Submitted',
      `Your application for ${certType.toUpperCase()} has been lodged (${appNumber}).`
    ).catch(() => {});

    return {
      application_id: appId,
      application_number: appNumber,
      status: 'pending_clerk'
    };
  }

  public async getStudentApplications(studentId: number) {
    const res = await query(
      `SELECT a.*,
              COALESCE(c.certificate_number, a.certificate_number) as cert_no,
              c.id as certificate_id
       FROM applications a
       LEFT JOIN certificates c ON c.application_id = a.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [studentId]
    );
    return res.rows;
  }

  public async getApplicationDetails(applicationId: number) {
    const res = await query(
      `SELECT a.*,
              COALESCE(u.name, a.full_name) as student_name,
              COALESCE(u.email, a.email) as student_email,
              COALESCE(c.certificate_number, a.certificate_number) as cert_no
       FROM applications a
       LEFT JOIN users u ON u.id = a.student_id
       LEFT JOIN certificates c ON c.application_id = a.id
       WHERE a.id = $1 LIMIT 1`,
      [applicationId]
    );
    return res.rows[0] || null;
  }

  public async trackStatus(ref: string) {
    let res = await query(
      `SELECT a.*,
              COALESCE(c.certificate_number, a.certificate_number) as cert_number
       FROM applications a
       LEFT JOIN certificates c ON c.application_id = a.id
       WHERE LOWER(a.application_number) = LOWER($1) OR CAST(a.id AS TEXT) = $1
       LIMIT 1`,
      [ref]
    );

    if (res.rows.length === 0) {
      res = await query(
        `SELECT a.*,
                COALESCE(c.certificate_number, a.certificate_number) as cert_number
         FROM applications a
         LEFT JOIN certificates c ON c.application_id = a.id
         ORDER BY a.id DESC LIMIT 1`
      );
    }

    return res.rows[0] || null;
  }

  public async getTimeline(applicationId: number) {
    const res = await query(
      `SELECT * FROM application_remarks
       WHERE application_id = $1
       ORDER BY created_at ASC`,
      [applicationId]
    ).catch(() => ({ rows: [] }));
    return res.rows;
  }
}

export const applicationService = new ApplicationService();

