// server.js - ChefOS Backend API (Cloud Run + Firestore + WhatsApp)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Inicialización de Firestore
const firestore = new Firestore();
const LEADS_COLLECTION = 'leads';

// Configuración de Notificaciones WhatsApp (Meta WhatsApp Cloud API / Gateway)
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER; // Formato internacional: ej. 52322XXXXXXX
const WEBHOOK_SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN || 'chefos_secure_token_2026';

// Función auxiliar para enviar mensaje por WhatsApp
async function sendWhatsAppAlert(messageText) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !MY_WHATSAPP_NUMBER) {
    console.log('⚠️ Variables de WhatsApp no configuradas. Mensaje generado en consola:');
    console.log(messageText);
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: MY_WHATSAPP_NUMBER,
        type: 'text',
        text: { body: messageText }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Mensaje de WhatsApp enviado correctamente.');
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error.response ? error.response.data : error.message);
  }
}

// Handler central para captura y almacenamiento de leads
async function handleLeadCapture(req, res) {
  try {
    const { nombre, email, telefono, whatsapp, fecha_evento, pax, servicio_interes, origen, notas } = req.body;
    const contactPhone = telefono || whatsapp;

    if (!nombre || !contactPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios: se requiere al menos nombre y teléfono/WhatsApp.'
      });
    }

    const contactEmail = email ? email.toLowerCase().trim() : 'no_proporcionado';
    const eventDate = fecha_evento || 'Por definir';
    const leadOrigin = origen || 'Página Web Oficial (chef4youbyfranko.com)';

    // Deduplicación persistente en Firestore (consultar si ya existe el lead en las últimas 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingLeadsSnapshot = await firestore.collection(LEADS_COLLECTION)
      .where('telefono', '==', contactPhone)
      .where('createdAt', '>=', oneDayAgo)
      .get();

    if (!existingLeadsSnapshot.empty) {
      return res.status(200).json({
        status: 'ignored',
        message: 'Lead duplicado detectado en base de datos en las últimas 24 horas.'
      });
    }

    const leadData = {
      nombre,
      email: contactEmail,
      telefono: contactPhone,
      fecha_evento: eventDate,
      pax: pax || 'No especificado',
      servicio_interes: servicio_interes || 'Cena Privada',
      origen: leadOrigin,
      notas: notas || '',
      estado: 'Nuevo',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Guardar en Firestore (Persistencia Real)
    const docRef = await firestore.collection(LEADS_COLLECTION).add(leadData);

    // Formatear mensaje para WhatsApp
    const alertMessage = `🚨 *¡NUEVO LEAD CHEF4YOU!* 🚨\n\n` +
      `👤 *Cliente:* ${nombre}\n` +
      `📱 *WhatsApp/Tel:* ${contactPhone}\n` +
      `📧 *Email:* ${contactEmail}\n` +
      `📅 *Fecha:* ${eventDate}\n` +
      `👥 *Pax:* ${leadData.pax}\n` +
      `🍽️ *Servicio:* ${leadData.servicio_interes}\n` +
      `🌐 *Origen:* ${leadOrigin}\n` +
      `🆔 *ID Firestore:* ${docRef.id}`;

    await sendWhatsAppAlert(alertMessage);

    return res.status(201).json({
      status: 'success',
      message: 'Lead guardado en Firestore y notificación enviada a WhatsApp.',
      leadId: docRef.id,
      data: leadData
    });
  } catch (error) {
    console.error('Error al guardar lead en Firestore:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
  }
}

// Endpoints de Captura (Compatible con /api/leads y /api/v1/lead-capture)
app.post('/api/leads', handleLeadCapture);
app.post('/api/v1/lead-capture', handleLeadCapture);

// Endpoint para alimentar el Dashboard de ChefOS (Consulta Firestore)
app.get('/api/leads', async (req, res) => {
  try {
    const snapshot = await firestore.collection(LEADS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const leads = [];
    snapshot.forEach(doc => {
      leads.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ status: 'success', count: leads.length, data: leads });
  } catch (error) {
    console.error('Error obteniendo leads de Firestore:', error);
    return res.status(500).json({ status: 'error', message: 'Error al consultar leads.' });
  }
});

// Endpoint URGENTE: Take a Chef / Private Chef Manager
app.post('/api/v1/take-a-chef-urgent', async (req, res) => {
  try {
    const incomingSecret = req.headers['x-webhook-token'];
    if (incomingSecret && incomingSecret !== WEBHOOK_SECRET_TOKEN) {
      return res.status(401).json({ status: 'error', message: 'Token de autenticación inválido.' });
    }

    const { subject, sender, snippet } = req.body;

    const urgentWhatsApp = `⚡⚡ *ALERTA URGENTE: TAKE A CHEF / PRIVATE CHEF MANAGER* ⚡⚡\n\n` +
      `📩 *De:* ${sender || 'info@privatechefmanager.com / Take a Chef'}\n` +
      `📌 *Asunto:* ${subject || 'Nueva Solicitud Entrante'}\n` +
      `💬 *Detalle:* ${snippet || 'Sin vista previa'}\n\n` +
      `👉 *Acción:* Responder de inmediato en la plataforma.`;

    await sendWhatsAppAlert(urgentWhatsApp);

    return res.status(200).json({
      status: 'success',
      message: 'Alerta urgente enviada a WhatsApp con éxito.'
    });
  } catch (error) {
    console.error('Error en alerta Take a Chef:', error);
    return res.status(500).json({ status: 'error', message: 'Error procesando alerta urgente.' });
  }
});

// Endpoint de prueba telefónica por WhatsApp
app.post('/api/v1/test-phone-notification', async (req, res) => {
  try {
    const testMsg = `📲 *PRUEBA DE CONEXIÓN CHEFOS WHATSAPP* 📲\n\n` +
      `✅ *Estado:* Notificaciones por WhatsApp operando al 100%.\n` +
      `⏱️ *Hora:* ${new Date().toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City' })}\n` +
      `📍 *Origen:* Google Cloud Run Serverless`;

    await sendWhatsAppAlert(testMsg);

    return res.status(200).json({
      status: 'success',
      message: 'Notificación de prueba enviada exitosamente a tu WhatsApp.'
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/health', (req, res) => res.status(200).send('ChefOS API Active & Ready'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ChefOS Serverless API corriendo en el puerto ${PORT}`));
