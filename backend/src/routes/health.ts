import { Router } from 'express';
import { query } from '../lib/db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  try {
    await query('SELECT 1');
    response.status(200).json({
      status: 'ok',
      service: 'college-portal-v2-api',
      database: 'connected',
      engine: 'Express 5 + TypeScript + PostgreSQL',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    response.status(503).json({
      status: 'degraded',
      service: 'college-portal-v2-api',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
