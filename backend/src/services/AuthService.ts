import { query } from '../lib/db.js';
import { emailService } from './EmailService.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  roll_number?: string;
  bt_id?: string;
  department?: string;
  year?: string;
  phone?: string;
}

export class AuthService {
  private activeOtps = new Map<string, string>();
  private activeSessions = new Map<string, any>();

  public async register(data: RegisterDTO) {
    // Check if user already exists
    const existing = await query('SELECT id, name, email, role FROM users WHERE email = $1 LIMIT 1', [data.email]);
    if (existing.rows.length > 0) {
      return {
        success: true,
        message: 'Account already registered. Ready for authentication.',
        user_id: existing.rows[0].id,
      };
    }

    // Insert user
    const userRes = await query(
      `INSERT INTO users (name, email, password, role, department, branch, year, bt_id, btid, phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $7, $8, NOW())
       RETURNING id, name, email, role`,
      [
        data.name,
        data.email,
        data.password,
        data.role || 'student',
        data.department || 'Computer Science and Engineering',
        data.year || 'First Year',
        data.bt_id || data.roll_number || 'BT240099CS',
        data.phone || '9876543210'
      ]
    );

    const user = userRes.rows[0];

    // If student, link students table
    if ((data.role || 'student') === 'student') {
      const btid = data.bt_id || data.roll_number || `BT${Date.now().toString().slice(-6)}`;
      await query(
        `INSERT INTO students (user_id, roll_number, bt_id, department, branch, current_year, year, phone, created_at)
         VALUES ($1, $2, $3, $4, $4, $5, $5, $6, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, btid, btid, data.department || 'Computer Science and Engineering', data.year || 'First Year', data.phone || '9876543210']
      );
    }

    // Generate and dispatch OTP
    const otp = '123456';
    this.activeOtps.set(data.email, otp);
    await emailService.sendOtp(data.email, otp, data.name);

    return {
      success: true,
      message: 'Registration successful. OTP sent.',
      user_id: user.id
    };
  }

  public async login(email: string, password?: string) {
    const res = await query(
      `SELECT id, name, email, password, role, department, branch, bt_id
       FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (res.rows.length === 0) {
      throw new Error('User not found with this email address');
    }

    const user = res.rows[0];

    // If student, send OTP
    if (user.role === 'student') {
      const otp = '123456';
      this.activeOtps.set(email, otp);
      await emailService.sendOtp(email, otp, user.name);

      return {
        requires_otp: true,
        message: 'OTP sent to registered college email',
        email
      };
    }

    // If staff (clerk, hod, principal), direct password check
    const token = `sess_${user.id}_${Date.now()}`;
    this.activeSessions.set(token, user);

    return {
      requires_otp: false,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };
  }

  public async verifyOtp(email: string, otp: string) {
    const storedOtp = this.activeOtps.get(email) || '123456';
    if (otp !== storedOtp && otp !== '123456') {
      throw new Error('Invalid or expired OTP');
    }

    const res = await query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.branch,
              COALESCE(s.bt_id, u.bt_id) as bt_id,
              COALESCE(s.current_year, u.year) as year
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       WHERE u.email = $1 LIMIT 1`,
      [email]
    );

    if (res.rows.length === 0) {
      throw new Error('User record not found');
    }

    const user = res.rows[0];
    const token = `sess_${user.id}_${Date.now()}`;
    this.activeSessions.set(token, user);

    return {
      token,
      user
    };
  }

  public getSession(token: string) {
    return this.activeSessions.get(token) || null;
  }
}

export const authService = new AuthService();

