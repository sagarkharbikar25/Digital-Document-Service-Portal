import QRCode from 'qrcode';
import { env } from '../config/env.js';

export class QRCodeService {
  /**
   * Generates a Data URL (base64 image) for public certificate verification URL
   */
  public async generateVerificationDataUrl(certificateNumber: string): Promise<string> {
    const verifyUrl = `${env.FRONTEND_URL}/verify?cert=${encodeURIComponent(certificateNumber)}`;
    return QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0f2b48',
        light: '#ffffff'
      }
    });
  }

  /**
   * Generates an SVG string for clean embedding into HTML / PDF templates
   */
  public async generateVerificationSvg(certificateNumber: string): Promise<string> {
    const verifyUrl = `${env.FRONTEND_URL}/verify?cert=${encodeURIComponent(certificateNumber)}`;
    return QRCode.toString(verifyUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#0f2b48',
        light: '#ffffff'
      }
    });
  }
}

export const qrCodeService = new QRCodeService();

