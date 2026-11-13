import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  public async sendOtp(toEmail: string, otp: string, recipientName: string = 'Student'): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: `JDCOEM Portal - One Time Password (OTP): ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fcfaf6; border-radius: 8px;">
            <h2 style="color: #0f2b48;">JD College of Engineering and Management</h2>
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>Your one-time authentication code for the Digital Document Services Portal is:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #b45309; padding: 12px 0;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.warn('[EmailService] Failed to send OTP email (non-fatal in dev):', err);
      return false;
    }
  }

  public async sendStatusUpdate(toEmail: string, appNumber: string, status: string, certType: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: `Update on Application ${appNumber} - ${status.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h3>Application Status Notification</h3>
            <p>Your application <strong>${appNumber}</strong> for <strong>${certType}</strong> has been updated to: <strong>${status}</strong>.</p>
            <p>Visit the portal at <a href="${env.FRONTEND_URL}/track-status">${env.FRONTEND_URL}/track-status</a> to check live progress.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.warn('[EmailService] Status email notification deferred:', err);
      return false;
    }
  }
}

export const emailService = new EmailService();

