import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { applicationsRouter } from './routes/applications.js';
import { approvalsRouter } from './routes/approvals.js';
import { certificatesRouter } from './routes/certificates.js';
import { notificationsRouter } from './routes/notifications.js';
import { studentRouter } from './routes/student.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost', 'http://127.0.0.1'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_request, response) =>
  response.json({
    name: 'JDCOEM Digital Document Portal V2 API',
    version: '0.2.0',
    status: 'operational',
    engine: 'Express 5 + TypeScript + PostgreSQL',
  })
);

app.use('/health', healthRouter);

// Mount API routes (supports both /api/auth and /auth)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/application', applicationsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/application', applicationsRouter);

app.use('/api/application', approvalsRouter);
app.use('/application', approvalsRouter);

app.use('/api/certificate', certificatesRouter);
app.use('/api/admin/certificates', certificatesRouter);
app.use('/certificate', certificatesRouter);

app.use('/api/notifications', notificationsRouter);
app.use('/notifications', notificationsRouter);

app.use('/api/student', studentRouter);
app.use('/api/profile', studentRouter);
app.use('/student', studentRouter);
app.use('/api/documents', studentRouter);
