import { query } from '../lib/db.js';
import { certificateGenerator } from './CertificateGenerator.js';
import { pdfService } from './PDFService.js';
import fs from 'fs';

export class CertificateService {
  public async generateCertificate(applicationId: number, principalId: number) {
    return certificateGenerator.generate(applicationId, principalId);
  }

  public async getCertificateByNumber(certificateNumber: string) {
    const res = await query(
      `SELECT c.*, a.student_id, a.certificate_type, a.status, a.full_name, a.btid,
              u.name as student_name, u.email as student_email
       FROM certificates c
       JOIN applications a ON a.id = c.application_id
       LEFT JOIN users u ON u.id = a.student_id
       WHERE c.certificate_number = $1
       LIMIT 1`,
      [certificateNumber]
    );
    return res.rows[0] || null;
  }

  public async getCertificateByApplicationId(applicationId: number) {
    const res = await query(
      `SELECT c.*, a.student_id, a.certificate_type, a.status
       FROM certificates c
       JOIN applications a ON a.id = c.application_id
       WHERE c.application_id = $1
       LIMIT 1`,
      [applicationId]
    );
    return res.rows[0] || null;
  }

  public async verifyHash(hash: string) {
    const res = await query(
      `SELECT c.certificate_number, c.generated_at, a.full_name, a.certificate_type, a.btid
       FROM certificates c
       JOIN applications a ON a.id = c.application_id
       WHERE c.file_hash = $1 OR c.document_hash = $1
       LIMIT 1`,
      [hash]
    );
    if (res.rows.length === 0) {
      return { verified: false, message: 'Invalid or unverified cryptographic digest' };
    }
    return { verified: true, certificate: res.rows[0] };
  }

  public getDownloadContent(certificateNumber: string): string | null {
    const filePath = pdfService.getCertificatePath(certificateNumber);
    if (filePath && fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  }
}

export const certificateService = new CertificateService();

