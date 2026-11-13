import { app } from './app.js';
import { env } from './config/env.js';
import { verifyEmailTransport } from './lib/email.js';

app.listen(env.PORT, async () => {
  try { await verifyEmailTransport(); console.log('SMTP transport verified'); }
  catch (error) { console.error('SMTP transport verification failed:', error); }
  console.log(`V2 API listening on http://localhost:${env.PORT}`);
});
