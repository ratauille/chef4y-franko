import type { FastifyInstance } from 'fastify';
import { firestore } from '../../shared/firestore.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/metrics', async (request, reply) => {
    const apiKey = process.env.INTERNAL_API_KEY || 'chefos-internal-key-2026';
    const requestKey = request.headers['x-api-key'] || request.headers['authorization']?.toString().replace(/^Bearer\s+/i, '');
    if (!requestKey || requestKey !== apiKey) {
      return reply.code(401).send({
        success: false,
        error: 'unauthorized',
        message: 'Acceso privado. Requiere clave de autorización x-api-key.',
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
        ['pendiente', 'pending', 'received'].includes(lead.estado || lead.status),
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
