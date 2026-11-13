import { fileUploadService } from './FileUploadService.js';

export class BonafideUploadService {
  public async handleAttachments(applicationId: number, files: Array<{ type: string; name: string; path: string }>) {
    const results = [];
    for (const f of files) {
      const docId = await fileUploadService.registerDocument(
        applicationId,
        f.type || 'bonafide_attachment',
        f.name,
        f.path
      );
      results.push({ document_id: docId, name: f.name });
    }
    return results;
  }
}

export const bonafideUploadService = new BonafideUploadService();

