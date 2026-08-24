import type { FastifyInstance } from 'fastify';
import { crmRoutes } from './crm.routes.js';

export async function firestoreLeadRoutes(app: FastifyInstance) {
  await app.register(crmRoutes);
}
