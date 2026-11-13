import { query } from '../lib/db.js';

export class CertificateNumberService {
  /**
   * Generates a unique institutional certificate number: CERT-YYYY-000000
   */
  public async generate(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CERT-${year}-`;

    const res = await query(
      `SELECT certificate_number
       FROM certificates
       WHERE certificate_number LIKE $1
       ORDER BY certificate_number DESC
       LIMIT 1`,
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (res.rows.length > 0 && res.rows[0].certificate_number) {
      const parts = res.rows[0].certificate_number.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    } else {
      // Fallback check on applications table
      const appRes = await query(
        `SELECT certificate_number
         FROM applications
         WHERE certificate_number LIKE $1
         ORDER BY certificate_number DESC
         LIMIT 1`,
        [`${prefix}%`]
      );
      if (appRes.rows.length > 0 && appRes.rows[0].certificate_number) {
        const parts = appRes.rows[0].certificate_number.split('-');
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextSeq = lastSeq + 1;
        }
      }
    }

    const padded = String(nextSeq).padStart(6, '0');
    return `${prefix}${padded}`;
  }
}

export const certificateNumberService = new CertificateNumberService();

