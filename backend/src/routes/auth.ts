import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/AuthService.js';

export const authRouter = Router();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'clerk', 'hod', 'principal', 'admin']).default('student'),
  roll_number: z.string().optional(),
  bt_id: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
});

/* ── POST /api/auth/register ── */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const result = await authService.register(data);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Registration failed' });
  }
});

/* ── POST /api/auth/login ── */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await authService.login(email, password);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/* ── POST /api/auth/verify-otp ── */
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = VerifyOtpSchema.parse(req.body);
    const result = await authService.verifyOtp(email, otp);
    return res.json({ success: true, message: 'OTP verified successfully', ...result });
  } catch (err: any) {
    return res.status(401).json({ success: false, message: err.message });
  }
});

/* ── GET /api/auth/csrf ── */
authRouter.get('/csrf', (_req: Request, res: Response) => {
  return res.json({ csrf_token: `csrf_${Date.now().toString(36)}` });
});

/* ── GET /api/auth/me ── */
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';
  const session = authService.getSession(token);

  if (session) {
    return res.json({ success: true, user: session });
  }

  // Demo fallback user
  return res.json({
    success: true,
    user: {
      id: 131,
      name: 'Akash Kumar',
      email: 'saarkharbikar@jdcoem.ac.in',
      role: 'student',
      department: 'Computer Science and Engineering',
      bt_id: 'BT240076CS',
      year: 'Third Year',
    },
  });
});

/* ── POST /api/auth/logout ── */
authRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});
