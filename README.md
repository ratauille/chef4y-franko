# chefos-api - Deploy Cloud Run

Perfecto — ese deploy.sh ya te deja el flujo limpio.

Yo voy con la B) README + comandos PRO con Secret Manager que es lo que te falta para producción. Te lo dejo listo para que lo guardes como README.md en la raíz:

# README.md

## deploy.sh

Script interactivo en la raíz para gestionar secretos.

**Qué hace:**
1. Pide `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WEBHOOK_SECRET_TOKEN`
2. Opción 1: Guarda en `.env` local
3. Opción 2: Inserta directo en Cloud Run con `gcloud run services update --update-env-vars`

**Uso:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Requisitos
- gcloud CLI: `gcloud auth login`
- Proyecto: `my-gcp-project-123`
- Service Account: `chefos-api@my-gcp-project-123.iam.gserviceaccount.com`

Deploy completo (Artifact Registry - Recomendado)
```bash
# Crear repo (solo 1 vez)
gcloud artifacts repositories create chefos-api --repository-format=docker --location=us-central1

# Build & Deploy
gcloud builds submit --tag us-central1-docker.pkg.dev/my-gcp-project-123/chefos-api/chefos-api:latest .

gcloud run deploy chefos-api \
 --image us-central1-docker.pkg.dev/my-gcp-project-123/chefos-api/chefos-api:latest \
 --region us-central1 \
 --service-account chefos-api@my-gcp-project-123.iam.gserviceaccount.com \
 --allow-unauthenticated --port 8080 \
 --set-secrets WHATSAPP_API_TOKEN=WHATSAPP_API_TOKEN:latest,WHATSAPP_PHONE_NUMBER_ID=WHATSAPP_PHONE_NUMBER_ID:latest,WEBHOOK_SECRET_TOKEN=WEBHOOK_SECRET_TOKEN:latest
```

Setup PRO con Secret Manager
```bash
# Crear secretos
echo -n "TOKEN" | gcloud secrets create WHATSAPP_API_TOKEN --data-file=-
echo -n "PHONE_ID" | gcloud secrets create WHATSAPP_PHONE_NUMBER_ID --data-file=-
echo -n "SECRET" | gcloud secrets create WEBHOOK_SECRET_TOKEN --data-file=-

# Dar acceso al Service Account
for SECRET in WHATSAPP_API_TOKEN WHATSAPP_PHONE_NUMBER_ID WEBHOOK_SECRET_TOKEN; do
  gcloud secrets add-iam-policy-binding $SECRET \
   --member="serviceAccount:chefos-api@my-gcp-project-123.iam.gserviceaccount.com" \
   --role="roles/secretmanager.secretAccessor"
done
```

Code

¿Quieres que ahora también te genere la **opción A**? Te creo el `cloudbuild.yaml` + `Dockerfile` optimizado para Node.js para que el push a `main` haga deploy automático.
