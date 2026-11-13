import { Router, Request, Response } from 'express';
import { certificateService } from '../services/CertificateService.js';
import { adminCertificateService } from '../services/AdminCertificateService.js';

export const certificatesRouter = Router();

/* ── GET /api/certificate/download ── */
certificatesRouter.get('/download', async (req: Request, res: Response) => {
  try {
    const certNumber = req.query.cert || req.query.certificate_number || req.query.cert_no;
    const appId = req.query.application_id || req.query.id;

    let cert = null;
    if (certNumber) {
      cert = await certificateService.getCertificateByNumber(certNumber as string);
    } else if (appId) {
      cert = await certificateService.getCertificateByApplicationId(parseInt(appId as string, 10));
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found or not yet issued' });
    }

    const htmlContent = certificateService.getDownloadContent(cert.certificate_number);
    if (htmlContent) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${cert.certificate_number}.html"`);
      return res.send(htmlContent);
    }

    return res.json({
      success: true,
      message: 'Certificate issued and ready',
      certificate: cert,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/certificate/verify ── */
certificatesRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    const certNumber = (req.query.cert || req.query.certificate_number || '') as string;
    if (!certNumber) return res.status(400).json({ success: false, message: 'cert parameter required' });

    const cert = await certificateService.getCertificateByNumber(certNumber);
    if (!cert) {
      return res.status(404).json({ success: false, verified: false, message: 'Invalid or forged certificate number' });
    }

    return res.json({
      success: true,
      verified: true,
      data: {
        certificate_number: cert.certificate_number,
        student_name: cert.student_name || cert.full_name,
        bt_id: cert.btid,
        certificate_type: cert.certificate_type,
        status: 'Officially Issued & Cryptographically Sealed',
        issued_at: cert.generated_at,
        file_hash: cert.file_hash,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/certificate/verify-hash ── */
certificatesRouter.post('/verify-hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ success: false, message: 'hash required' });

    const result = await certificateService.verifyHash(hash);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/admin/certificates ── */
certificatesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q || req.query.search || '') as string;
    const certs = q
      ? await adminCertificateService.searchCertificates(q)
      : await adminCertificateService.getAllCertificates();
    return res.json({ success: true, data: certs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
