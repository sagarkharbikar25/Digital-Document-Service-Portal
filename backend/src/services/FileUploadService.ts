import path from 'path';
import fs from 'fs';
import { query } from '../lib/db.js';

export class FileUploadService {
  private uploadRoot: string;

  constructor() {
    this.uploadRoot = path.resolve(process.cwd(), 'storage/uploads');
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  public getSubfolder(admType: string): string {
    const type = admType.toLowerCase().trim();
    const folderMap: Record<string, string> = {
      bonafide: 'bonafide',
      character: 'character',
      idcard: 'id_card',
      noc: 'noc',
      transcript: 'transcript',
      fees_receipt: 'fees_receipt',
      admission: 'admission',
      tc: 'tc',
      leaving: 'leaving',
      migration: 'migration',
      marksheet: 'marksheet',
      provisional: 'provisional',
      degree: 'degree',
      hallticket: 'hallticket',
    };
    const folder = folderMap[type] || 'general';
    const fullPath = path.join(this.uploadRoot, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  public async registerDocument(
    applicationId: number,
    documentType: string,
    fileName: string,
    filePath: string
  ): Promise<number> {
    const res = await query(
      `INSERT INTO application_documents (application_id, document_type, file_name, file_path, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [applicationId, documentType, fileName, filePath]
    );
    return res.rows[0].id;
  }

  public async getDocuments(applicationId: number) {
    const res = await query(
      `SELECT * FROM application_documents WHERE application_id = $1 ORDER BY created_at ASC`,
      [applicationId]
    );
    return res.rows;
  }
}

export const fileUploadService = new FileUploadService();

