#!/bin/bash
set -e

PROJECT_ID="my-gcp-project-123"
REGION="us-central1"
SERVICE_NAME="chefos-api"

echo "=== CONFIGURADOR CHEFOS-API ==="
read -p "1. WHATSAPP_API_TOKEN: " TOKEN
read -p "2. WHATSAPP_PHONE_NUMBER_ID: " PHONE_ID
read -p "3. WEBHOOK_SECRET_TOKEN: " WEBHOOK

echo ""
echo "¿Qué quieres hacer?"
echo "1 = Guardar en .env local"
echo "2 = Insertar directo en Cloud Run (my-gcp-project-123)"
read -p "Indica 1 ó 2: " OPCION

# Genera el string de env vars
ENV_VARS="WHATSAPP_API_TOKEN=${TOKEN},WHATSAPP_PHONE_NUMBER_ID=${PHONE_ID},WEBHOOK_SECRET_TOKEN=${WEBHOOK}"

if [ "$OPCION" == "1" ]; then
  echo "WHATSAPP_API_TOKEN=${TOKEN}" > .env
  echo "WHATSAPP_PHONE_NUMBER_ID=${PHONE_ID}" >> .env
  echo "WEBHOOK_SECRET_TOKEN=${WEBHOOK}" >> .env
  echo ""
  echo "✅ Guardado en .env"
  cat .env

elif [ "$OPCION" == "2" ]; then
  echo ">>> Insertando en Cloud Run..."
  gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --project $PROJECT_ID \
    --update-env-vars $ENV_VARS
  
  echo "✅ Insertado en Cloud Run"
  gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
else
  echo "Opción no válida"
fi
