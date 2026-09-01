#!/bin/bash
set -e

PROJECT_ID="my-gcp-project-123"
REGION="us-central1"
SERVICE_NAME="chefos-api"

echo "=== TEST DEPLOY CHEFOS-API ==="

# 1. Obtener URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format="value(status.url)")
echo "Service URL: $SERVICE_URL"
if [ -z "$SERVICE_URL" ]; then echo "ERROR: No se encontró el servicio"; exit 1; fi

# Obtener secret para el test (si tienes acceso)
WEBHOOK_SECRET=$(gcloud secrets versions access latest --secret=WEBHOOK_SECRET_TOKEN --project=$PROJECT_ID 2>/dev/null || echo "YOUR_WEBHOOK_SECRET")
echo "Usando WEBHOOK_SECRET: ${WEBHOOK_SECRET:0:5}..."

echo ""
echo "1/4 Health check..."
curl -i "$SERVICE_URL/health"
echo -e "\n"

echo "2/4 Test phone notification..."
curl -X POST "$SERVICE_URL/api/v1/test-phone-notification" \
-H "Content-Type: application/json" \
-d '{}' -w "\nHTTP: %{http_code}\n"
echo ""

echo "3/4 Simular webhook urgente (Take a Chef)..."
curl -X POST "$SERVICE_URL/api/v1/take-a-chef-urgent" \
-H "Content-Type: application/json" \
-H "x-webhook-token: $WEBHOOK_SECRET" \
-d '{ "subject":"Solicitud urgente - cliente VIP", "sender":"take@privatechef.example", "snippet":"Cliente solicita chef para evento mañana 8pm" }' -w "\nHTTP: %{http_code}\n"
echo ""

echo "4/4 Crear lead de prueba..."
curl -X POST "$SERVICE_URL/api/leads" \
-H "Content-Type: application/json" \
-d '{ "nombre":"María Pérez", "telefono":"521234567890", "email":"maria@example.com", "fecha_evento":"2026-12-24", "pax":"6", "servicio_interes":"Cena Privada", "notas":"Test desde test-deploy.sh" }' -w "\nHTTP: %{http_code}\n"
echo ""

echo "=== FIN TESTS - Revisa logs si algo falló ==="
echo "gcloud run services logs read $SERVICE_NAME --region $REGION --project $PROJECT_ID --limit=30"
