import fs from 'fs';
import path from 'path';

export class PDFService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.resolve(process.cwd(), 'storage/certificates');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Saves the rendered certificate document to disk
   */
  public async saveCertificateHtml(certificateNumber: string, htmlContent: string): Promise<string> {
    const filename = `${certificateNumber}.html`;
    const filePath = path.join(this.outputDir, filename);
    await fs.promises.writeFile(filePath, htmlContent, 'utf8');
    return filePath;
  }

  public getCertificatePath(certificateNumber: string): string | null {
    const htmlPath = path.join(this.outputDir, `${certificateNumber}.html`);
    const pdfPath = path.join(this.outputDir, `${certificateNumber}.pdf`);
    if (fs.existsSync(pdfPath)) return pdfPath;
    if (fs.existsSync(htmlPath)) return htmlPath;
    return null;
  }
}

export const pdfService = new PDFService();

