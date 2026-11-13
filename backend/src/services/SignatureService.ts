import crypto from 'crypto';

export class SignatureService {
  /**
   * Generates SHA-256 hash of certificate payload or file content
   */
  public generateHash(payload: string | Buffer): string {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Generates institutional cryptographic digest for an issued document
   */
  public signCertificate(certificateNumber: string, studentBtId: string, timestamp: string): string {
    const raw = `${certificateNumber}|${studentBtId}|${timestamp}|JDCOEM_INSTITUTIONAL_KEY`;
    return this.generateHash(raw);
  }

  /**
   * Verifies if a given hash matches the document payload
   */
  public verify(payload: string | Buffer, expectedHash: string): boolean {
    const computed = this.generateHash(payload);
    return computed.toLowerCase() === expectedHash.toLowerCase();
  }
}

export const signatureService = new SignatureService();

