import Fastify from 'fastify';
import cors from '@fastify/cors';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { crmRoutes } from './modules/crm/crm.routes.js';

const app = Fastify({ logger: true });

const ALLOWED_ORIGINS = [
  'https://chef4youbyfranko.com',
  'https://franko.chefos.com',
  'https://chef4y.com',
  'https://ratauille.github.io',
  'https://chefos-backend-74980816903.us-central1.run.app',
];

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      cb(null, true);
      return;
    }
    cb(null, false);
  },
  allowedHeaders: ['Content-Type', 'x-api-key', 'Idempotency-Key', 'x-idempotency-key', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});

app.get('/health', async () => ({ ok: true, service: 'chefos-fastify-api', timestamp: new Date().toISOString() }));

await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(crmRoutes, { prefix: '/api' });

const port = Number(process.env.PORT || process.env.FASTIFY_PORT || 8080);
const host = process.env.FASTIFY_HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`Servidor Fastify ChefOS activo en http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
