import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FieldValue, DocumentSnapshot } from '@google-cloud/firestore';
import { firestore } from '../../shared/firestore.js';

interface LeadInput {
  nombre?: string;
  fullName?: string;
  email?: string;
  telefono?: string;
  phone?: string;
  preferredChannel?: string;
  servicio?: string;
  experienceType?: string;
  serviceArea?: string;
  serviceDate?: string;
  guestCount?: number | string;
  message?: string;
  privacyConsent?: boolean | string;
  contactConsent?: boolean | string;
  emailMarketing?: boolean | string;
  lang?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  landingPage?: string;
  estado?: string;
  status?: string;
  [key: string]: unknown;
}

function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.toString().trim().toLowerCase();
}

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function serializeDoc(snapshot: DocumentSnapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null,
    deletedAt: data.deletedAt?.toDate?.()?.toISOString?.() || data.deletedAt || null,
    firstViewedAt: data.firstViewedAt?.toDate?.()?.toISOString?.() || data.firstViewedAt || null,
  };
}

// Protección de seguridad con CHEFOS_ADMIN_API_KEY
function verifyAuth(request: FastifyRequest, reply: FastifyReply): boolean {
  const adminKey = process.env.CHEFOS_ADMIN_API_KEY || process.env.INTERNAL_API_KEY || 'chefos-internal-key-2026';
  const requestKey = (request.headers['x-api-key'] || request.headers['authorization']?.toString().replace(/^Bearer\s+/i, '') || '').toString().trim();

  if (!requestKey || requestKey !== adminKey.trim()) {
    reply.code(401).send({
      success: false,
      error: 'unauthorized',
      message: 'Acceso privado no autorizado. Requiere clave administrativa válida.',
    });
    return false;
  }
  return true;
}

function logAudit(action: string, id: string, reason?: string) {
  const date = new Date().toISOString();
  const reasonText = reason ? ` | Reason: ${reason}` : '';
  console.log(`[AUDIT] Action: ${action} | ID: ${id} | Date: ${date}${reasonText}`);
}

export async function crmRoutes(app: FastifyInstance) {
  // 1. STATIC ROUTES FIRST (To prevent Fastify :id route conflict)

  // GET /api/leads (Protegido - Solo leads activos, excluye papelera)
  app.get('/leads', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const snapshot = await firestore.collection('leads').get();
      const docs = snapshot.docs
        .map(serializeDoc)
        .filter((d: any) => !d.isDeleted && d.estado !== 'papelera' && d.status !== 'papelera');

      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      return reply.send({ success: true, data: docs });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({
        success: false,
        error: 'firestore_unavailable',
        message: error.message || 'Error al obtener leads desde Firestore.',
      });
    }
  });

  // GET /api/leads/trash (Protegido - Obtener solo leads en la papelera)
  app.get('/leads/trash', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const snapshot = await firestore.collection('leads').get();
      const docs = snapshot.docs
        .map(serializeDoc)
        .filter((d: any) => d.isDeleted === true || d.estado === 'papelera' || d.status === 'papelera');

      docs.sort((a: any, b: any) => {
        const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
        return timeB - timeA;
      });
      return reply.send({ success: true, data: docs });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({
        success: false,
        error: 'firestore_unavailable',
        message: error.message || 'Error al obtener leads de la papelera.',
      });
    }
  });

  // POST /api/leads/batch-trash (Protegido - Mover selección a papelera)
  app.post<{ Body: { ids?: string[]; deleteReason?: string } }>('/leads/batch-trash', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const ids = Array.isArray(request.body?.ids) ? request.body.ids : [];
      const deleteReason = (request.body?.deleteReason || 'otro').toString().trim();

      if (ids.length === 0) {
        return reply.code(400).send({ success: false, error: 'validation_error', message: 'Se requiere una lista de IDs.' });
      }

      const batch = firestore.batch();
      for (const id of ids) {
        const docRef = firestore.collection('leads').doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data() || {};
          const previousStatus = data.estado || data.status || 'nuevo';
          batch.update(docRef, {
            isDeleted: true,
            deletedAt: FieldValue.serverTimestamp(),
            deletedBy: 'Chef Franko (Admin)',
            deleteReason,
            previousStatus,
            estado: 'papelera',
            status: 'papelera',
            updatedAt: FieldValue.serverTimestamp(),
          });
          logAudit('BATCH_TRASH', id, deleteReason);
        }
      }

      await batch.commit();
      return reply.send({ success: true, count: ids.length, deleteReason });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // GET /api/leads/recent?limit=10 (Protegido)
  app.get<{ Querystring: { limit?: string } }>('/leads/recent', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const limitRaw = parseInt(request.query.limit || '10', 10);
      const limit = isNaN(limitRaw) ? 10 : Math.max(1, Math.min(limitRaw, 50));

      const snapshot = await firestore.collection('leads').get();
      const docs = snapshot.docs
        .map((doc) => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            nombre: data.nombre || data.fullName || 'Sin nombre',
            email: data.email || null,
            telefono: data.telefono || data.phone || null,
            servicio: data.servicio || data.experienceType || null,
            estado: data.estado || data.status || 'nuevo',
            isDeleted: data.isDeleted || false,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
          };
        })
        .filter((d: any) => !d.isDeleted && d.estado !== 'papelera');

      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return reply.send({
        success: true,
        count: Math.min(docs.length, limit),
        data: docs.slice(0, limit),
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({
        success: false,
        error: 'firestore_unavailable',
        message: error.message || 'Error al obtener leads recientes.',
      });
    }
  });

  // 2. PARAMETERIZED ROUTES AFTER STATIC ROUTES

  // POST /api/leads/:id/trash (Protegido - Mover a papelera individual)
  app.post<{ Params: { id: string }; Body: { deleteReason?: string; deletedBy?: string } }>('/leads/:id/trash', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      const deleteReason = (request.body?.deleteReason || 'otro').toString().trim();
      const deletedBy = (request.body?.deletedBy || 'Chef Franko (Admin)').toString().trim();

      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado.' });
      }

      const data = docSnap.data() || {};
      const previousStatus = data.estado || data.status || 'nuevo';

      await docRef.update({
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy,
        deleteReason,
        previousStatus,
        estado: 'papelera',
        status: 'papelera',
        updatedAt: FieldValue.serverTimestamp(),
      });

      logAudit('TRASH', id, deleteReason);
      return reply.send({ success: true, id, deleteReason, previousStatus });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // POST /api/leads/:id/restore (Protegido - Restaurar de papelera)
  app.post<{ Params: { id: string } }>('/leads/:id/restore', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado.' });
      }

      const data = docSnap.data() || {};
      const restoredStatus = data.previousStatus || 'nuevo';

      await docRef.update({
        isDeleted: false,
        deletedAt: FieldValue.delete(),
        deletedBy: FieldValue.delete(),
        deleteReason: FieldValue.delete(),
        estado: restoredStatus,
        status: restoredStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logAudit('RESTORE', id);
      return reply.send({ success: true, id, status: restoredStatus });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // DELETE /api/leads/:id/permanent (Protegido - Eliminar permanentemente únicamente el ID seleccionado)
  app.delete<{ Params: { id: string } }>('/leads/:id/permanent', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      if (!id || typeof id !== 'string') {
        return reply.code(400).send({ success: false, error: 'validation_error', message: 'Se requiere ID válido.' });
      }

      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado en Firestore.' });
      }

      await docRef.delete();
      logAudit('PERMANENT_DELETE', id);

      return reply.send({ success: true, id, message: 'Lead eliminado permanentemente.' });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // POST /api/leads/:id/viewed (Protegido - Registrar primera visualización firstViewedAt)
  app.post<{ Params: { id: string } }>('/leads/:id/viewed', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado.' });
      }

      const data = docSnap.data() || {};
      if (!data.firstViewedAt) {
        await docRef.update({
          firstViewedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        logAudit('FIRST_VIEWED', id);
      }

      return reply.send({ success: true, id });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // PATCH /api/leads/:id/status (Protegido - Actualizar estado de lead)
  app.patch<{ Params: { id: string }; Body: { estado?: string; status?: string } }>('/leads/:id/status', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      const estado = (request.body?.estado || request.body?.status || '').toString().trim();
      if (!estado) {
        return reply.code(400).send({ success: false, error: 'validation_error', message: 'Se requiere el nuevo estado.' });
      }

      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado.' });
      }

      await docRef.update({
        estado,
        status: estado,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logAudit('STATUS_UPDATE', id, estado);
      return reply.send({ success: true, id, estado });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // POST /api/leads/:id/notes (Protegido - Agregar nota a lead)
  app.post<{ Params: { id: string }; Body: { note?: string } }>('/leads/:id/notes', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const { id } = request.params;
      const note = (request.body?.note || '').toString().trim();
      if (!note) {
        return reply.code(400).send({ success: false, error: 'validation_error', message: 'La nota no puede estar vacía.' });
      }

      const docRef = firestore.collection('leads').doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return reply.code(404).send({ success: false, error: 'not_found', message: 'Lead no encontrado.' });
      }

      await docRef.update({
        notes: FieldValue.arrayUnion(note),
        lastNote: note,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logAudit('ADD_NOTE', id);
      return reply.send({ success: true, id, note });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ success: false, error: 'internal_error', message: error.message });
    }
  });

  // POST /api/leads (PÚBLICO PARA CAPTURA DE LEADS)
  app.post<{ Body: LeadInput }>('/leads', async (request, reply) => {
    try {
      const body = request.body || {};
      const idempotencyKey = (request.headers['idempotency-key'] || request.headers['x-idempotency-key'] || '').toString().trim();

      const nombre = (body.nombre || body.fullName || '').toString().trim();
      const rawEmail = (body.email || '').toString().trim();
      const rawPhone = (body.telefono || body.phone || '').toString().trim();

      const email = normalizeEmail(rawEmail);
      const phoneDigits = normalizePhone(rawPhone);
      const telefono = rawPhone;

      const preferredChannel = (body.preferredChannel || 'whatsapp').toString().trim();
      const servicio = (body.servicio || body.experienceType || body.serviceArea || '').toString().trim();
      const serviceArea = (body.serviceArea || '').toString().trim();
      const serviceDate = (body.serviceDate || '').toString().trim();
      const guestCount = body.guestCount ? Number(body.guestCount) : undefined;
      const message = (body.message || '').toString().trim();
      const privacyConsent: boolean = body.privacyConsent === true || String(body.privacyConsent) === 'true';
      const contactConsent: boolean = body.contactConsent === true || String(body.contactConsent) === 'true';
      const emailMarketing: boolean = body.emailMarketing === true || String(body.emailMarketing) === 'true';
      const lang = (body.lang || 'es').toString().trim();

      // Atribución
      const source = (body.source || 'direct').toString().trim();
      const medium = (body.medium || 'organic').toString().trim();
      const campaign = body.campaign ? String(body.campaign).trim() : undefined;
      const referrer = body.referrer ? String(body.referrer).trim() : undefined;
      const landingPage = body.landingPage ? String(body.landingPage).trim() : undefined;

      const estado = (body.estado || body.status || 'nuevo').toString().trim();

      // 1. Validaciones obligatorias
      if (!nombre || nombre.length < 2) {
        return reply.code(400).send({
          success: false,
          error: 'validation_error',
          message: 'El nombre completo es obligatorio y debe tener al menos 2 caracteres.',
        });
      }

      if (!email && !phoneDigits) {
        return reply.code(400).send({
          success: false,
          error: 'validation_error',
          message: 'Se requiere al menos un medio de contacto válido (correo o teléfono).',
        });
      }

      if (email && !isValidEmail(email)) {
        return reply.code(400).send({
          success: false,
          error: 'validation_error',
          message: 'El correo electrónico proporcionado no es válido.',
        });
      }

      if (phoneDigits && phoneDigits.length < 7) {
        return reply.code(400).send({
          success: false,
          error: 'validation_error',
          message: 'El número de teléfono debe contener al menos 7 dígitos.',
        });
      }

      // 2. Comprobar Idempotencia por Idempotency-Key
      if (idempotencyKey) {
        const existingKeySnap = await firestore.collection('leads')
          .where('idempotencyKey', '==', idempotencyKey)
          .limit(1)
          .get();

        if (!existingKeySnap.empty) {
          const existingDoc = existingKeySnap.docs[0];
          return reply.code(200).send({
            success: true,
            id: existingDoc.id,
            duplicate: true,
            message: 'Lead procesado previamente con Idempotency-Key.',
          });
        }
      }

      // 3. Deduplicación por correo o teléfono dentro de ventana de tiempo (últimos 15 minutos)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentLeadsSnap = await firestore.collection('leads').get();
      const duplicateDoc = recentLeadsSnap.docs.find((doc) => {
        const data = doc.data();
        const docEmail = normalizeEmail(data.email);
        const docPhone = normalizePhone(data.telefono || data.phone || data.phoneDigits);
        const createdAtDate = data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null);

        const isSameEmail = Boolean(email && docEmail === email);
        const isSamePhone = Boolean(phoneDigits && docPhone === phoneDigits);
        const isRecent = createdAtDate ? createdAtDate >= fifteenMinutesAgo : true;

        return (isSameEmail || isSamePhone) && isRecent;
      });

      if (duplicateDoc) {
        const updateData = cleanUndefined({
          updatedAt: FieldValue.serverTimestamp(),
          lastAttemptMessage: message || undefined,
        });

        await firestore.collection('leads').doc(duplicateDoc.id).update(updateData);

        return reply.code(200).send({
          success: true,
          id: duplicateDoc.id,
          duplicate: true,
          message: 'Un lead reciente con los mismos datos ya fue registrado.',
        });
      }

      // 4. Registro de nuevo Lead en Firestore
      const leadPayload = cleanUndefined({
        nombre,
        fullName: nombre,
        email: email || undefined,
        telefono: telefono || undefined,
        phone: telefono || undefined,
        phoneDigits: phoneDigits || undefined,
        preferredChannel,
        servicio,
        experienceType: servicio,
        serviceArea: serviceArea || undefined,
        serviceDate: serviceDate || undefined,
        guestCount: guestCount || undefined,
        message: message || undefined,
        privacyConsent,
        contactConsent,
        emailMarketing,
        lang,
        source,
        medium,
        campaign: campaign || undefined,
        referrer: referrer || undefined,
        landingPage: landingPage || undefined,
        estado,
        status: estado,
        idempotencyKey: idempotencyKey || undefined,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const docRef = firestore.collection('leads').doc();
      await docRef.set(leadPayload);

      return reply.code(201).send({
        success: true,
        id: docRef.id,
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({
        success: false,
        error: 'firestore_unavailable',
        message: error.message || 'Error guardando lead en Firestore.',
      });
    }
  });

  // GET /api/quotes (Protegido)
  app.get('/quotes', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const snapshot = await firestore.collection('quotes').get();
      const docs = snapshot.docs.map(serializeDoc);
      return reply.send({ success: true, data: docs });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({ success: false, error: 'firestore_unavailable', message: error.message });
    }
  });

  // GET /api/reservations (Protegido)
  app.get('/reservations', async (request, reply) => {
    if (!verifyAuth(request, reply)) return;
    try {
      const snapshot = await firestore.collection('reservations').get();
      const docs = snapshot.docs.map(serializeDoc);
      return reply.send({ success: true, data: docs });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(503).send({ success: false, error: 'firestore_unavailable', message: error.message });
    }
  });
}
