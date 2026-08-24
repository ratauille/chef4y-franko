import type { FastifyInstance } from 'fastify';
import { firestore } from '../../shared/firestore.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/metrics', async (request, reply) => {
    const adminKey = process.env.CHEFOS_ADMIN_API_KEY || process.env.INTERNAL_API_KEY || 'chefos-internal-key-2026';
    const requestKey = (request.headers['x-api-key'] || request.headers['authorization']?.toString().replace(/^Bearer\s+/i, '') || '').toString().trim();

    if (!requestKey || requestKey !== adminKey.trim()) {
      return reply.code(401).send({
        success: false,
        error: 'unauthorized',
        message: 'Acceso privado no autorizado. Requiere clave administrativa válida.',
      });
    }

    try {
      const [leadsSnap, quotesSnap, reservationsSnap] = await Promise.all([
        firestore.collection('leads').get(),
        firestore.collection('quotes').get(),
        firestore.collection('reservations').get(),
      ]);

      const leadsDocs = leadsSnap.docs.map((doc) => doc.data());
      const pendingLeads = leadsDocs.filter((lead) =>
        ['nuevo', 'pendiente', 'pending', 'received'].includes((lead.estado || lead.status || '').toLowerCase()),
      ).length;

      return reply.send({
        leads: leadsSnap.size,
        quotes: quotesSnap.size,
        reservations: reservationsSnap.size,
        pendingLeads,
        recentActivity: [],
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({
        success: false,
        error: 'firestore_unavailable',
        message: error.message || 'Error calculando métricas del dashboard.',
      });
    }
  });
}
