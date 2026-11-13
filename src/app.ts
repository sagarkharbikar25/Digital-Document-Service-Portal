import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_request, response) => {
  response.json({ name: 'College Portal V2 API', version: '0.1.0' });
});

app.use('/health', healthRouter);
