import { query } from '../lib/db.js';

export class ApplicationNumberService {
  /**
   * Generates a standard institutional application number: APP-YYYY-000000
   */
  public generate(applicationId: number): string {
    const year = new Date().getFullYear();
    const padded = String(applicationId).padStart(6, '0');
    return `APP-${year}-${padded}`;
  }

  /**
   * Assigns and persists the application number to the database if not already present
   */
  public async assign(applicationId: number): Promise<string> {
    const check = await query('SELECT application_number FROM applications WHERE id = $1 LIMIT 1', [applicationId]);
    if (check.rows.length > 0 && check.rows[0].application_number) {
      return check.rows[0].application_number;
    }

    const appNumber = this.generate(applicationId);
    await query('UPDATE applications SET application_number = $1, updated_at = NOW() WHERE id = $2', [appNumber, applicationId]);
    return appNumber;
  }
}

export const applicationNumberService = new ApplicationNumberService();

