export class CertificateTemplateService {
  /**
   * Renders the institutional HTML document for printing or PDF compilation
   */
  public render(data: {
    certificateNumber: string;
    studentName: string;
    btId: string;
    branch: string;
    year: string;
    purpose: string;
    issueDate: string;
    qrSvg: string;
    hash: string;
    certificateType: string;
    metadata?: Record<string, any>;
  }): string {
    const certTitle = data.certificateType.toUpperCase() + ' CERTIFICATE';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${certTitle} - ${data.certificateNumber}</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; background: #ffffff; color: #1e293b; }
    .border-container { border: 4px double #0f2b48; padding: 30px; position: relative; min-height: 800px; }
    .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 15px; margin-bottom: 30px; }
    .college-name { font-size: 24px; font-weight: bold; color: #0f2b48; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 13px; color: #475569; margin: 4px 0; }
    .badge { font-weight: bold; color: #b45309; font-size: 12px; }
    .cert-title { font-size: 20px; font-weight: bold; text-decoration: underline; margin: 30px 0; letter-spacing: 2px; text-align: center; }
    .content { font-size: 16px; line-height: 2; text-align: justify; margin: 20px 0; }
    .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
    .qr-box { text-align: center; width: 140px; }
    .sign-box { text-align: center; width: 220px; border-top: 1px solid #1e293b; padding-top: 8px; font-weight: bold; }
    .meta-seal { font-family: monospace; font-size: 9px; color: #64748b; margin-top: 30px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="border-container">
    <div class="header">
      <div class="badge">Government of Maharashtra recognized | NAAC Accredited | Affiliated to RTM Nagpur University</div>
      <h1 class="college-name">JD College of Engineering and Management</h1>
      <div class="subtitle">Nagpur, Maharashtra - 441501 | AN AUTONOMOUS INSTITUTE</div>
      <div class="subtitle">Autonomous Examination & Certification Cell</div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 13px;">
      <div><strong>Ref No:</strong> ${data.certificateNumber}</div>
      <div><strong>Date of Issue:</strong> ${data.issueDate}</div>
    </div>

    <div class="cert-title">${certTitle}</div>

    <div class="content">
      This is to certify that <strong>Mr./Ms. ${data.studentName}</strong>, bearing College Roll / BT ID 
      <strong>${data.btId}</strong>, is a bonafide student of <strong>JD College of Engineering and Management, Nagpur</strong>.
      He / She is actively pursuing <strong>${data.branch}</strong> in <strong>${data.year}</strong>.
      <br><br>
      As per the autonomous institutional academic registry, his/her academic standing and conduct have been found to be satisfactory.
      This certificate is officially endorsed for: <strong>${data.purpose || 'Official Academic Submission'}</strong>.
    </div>

    <div class="footer">
      <div class="qr-box">
        ${data.qrSvg}
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Scan to Verify</div>
      </div>
      <div class="sign-box">
        Principal & Sanctioning Authority<br>
        <span style="font-size: 11px; font-weight: normal; color: #475569;">JD College of Engineering & Management</span>
      </div>
    </div>

    <div class="meta-seal">
      CRYPTOGRAPHIC SHA-256 DIGITAL DIGEST:<br>
      ${data.hash}
    </div>
  </div>
</body>
</html>`;
  }
}

export const certificateTemplateService = new CertificateTemplateService();

