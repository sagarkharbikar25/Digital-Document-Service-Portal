import { query } from '../lib/db.js';
import { certificateNumberService } from './CertificateNumberService.js';
import { qrCodeService } from './QRCodeService.js';
import { signatureService } from './SignatureService.js';
import { certificateTemplateService } from './CertificateTemplateService.js';
import { pdfService } from './PDFService.js';

export class CertificateGenerator {
  /**
   * Generates, signs, seals, and records an official certificate
   */
  public async generate(applicationId: number, principalId: number): Promise<{
    certificateNumber: string;
    filePath: string;
    hash: string;
  }> {
    // 1. Fetch application and student details
    const appRes = await query(
      `SELECT a.*,
              COALESCE(u.name, a.full_name) as student_name,
              COALESCE(u.email, a.email) as student_email,
              COALESCE(s.bt_id, a.btid) as bt_id,
              COALESCE(a.branch, s.department, s.branch, 'Engineering') as dept_branch,
              COALESCE(a.year, s.current_year, s.year, 'Current Year') as acad_year
       FROM applications a
       LEFT JOIN users u ON u.id = a.student_id
       LEFT JOIN students s ON s.user_id = a.student_id
       WHERE a.id = $1 LIMIT 1`,
      [applicationId]
    );

    if (appRes.rows.length === 0) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const app = appRes.rows[0];

    // 2. Generate sequential certificate number
    const certNumber = await certificateNumberService.generate();
    const issueDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // 3. Generate QR Code and cryptographic digest
    const qrSvg = await qrCodeService.generateVerificationSvg(certNumber);
    const hash = signatureService.signCertificate(certNumber, app.bt_id, issueDate);

    // 4. Render HTML Template
    const htmlContent = certificateTemplateService.render({
      certificateNumber: certNumber,
      studentName: app.student_name,
      btId: app.bt_id,
      branch: app.dept_branch,
      year: app.acad_year,
      purpose: app.purpose,
      issueDate,
      qrSvg,
      hash,
      certificateType: app.certificate_type || 'bonafide',
      metadata: app.metadata || {}
    });

    // 5. Save document to disk
    const filePath = await pdfService.saveCertificateHtml(certNumber, htmlContent);

    // 6. Record in certificates table
    await query(
      `INSERT INTO certificates
       (application_id, certificate_number, file_path, file_hash, document_hash, generated_by, generated_at)
       VALUES ($1, $2, $3, $4, $4, $5, NOW())
       ON CONFLICT (application_id) DO UPDATE SET
         certificate_number = EXCLUDED.certificate_number,
         file_path = EXCLUDED.file_path,
         file_hash = EXCLUDED.file_hash`,
      [applicationId, certNumber, filePath, hash, principalId]
    );

    // 7. Update application status to issued
    await query(
      `UPDATE applications
       SET status = 'issued',
           principal_status = 'approved',
           certificate_number = $2,
           certificate_file = $3,
           certificate_hash = $4,
           issued_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [applicationId, certNumber, filePath, hash]
    );

    return {
      certificateNumber: certNumber,
      filePath,
      hash
    };
  }
}

export const certificateGenerator = new CertificateGenerator();

