import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  const { error } = await supabase.from('health_check').select('id').limit(1);
  const schemaPending = error?.code === '42P01';
  const healthy = !error || schemaPending;

  response.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'college-portal-v2-api',
    database: schemaPending ? 'connected-schema-pending' : error ? 'unavailable' : 'connected',
    timestamp: new Date().toISOString()
  });
});
