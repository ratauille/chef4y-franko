# Tests Deploy chefos-api

## URL

```bash
# Obtener la URL pública del servicio Cloud Run
gcloud run services describe chefos-api --region us-central1 --project my-gcp-project-123 --format="value(status.url)"
```

Tests

- Health: curl $SERVICE_URL/health -> 200 ChefOS API Active & Ready
- WhatsApp Test: POST $SERVICE_URL/api/v1/test-phone-notification -> 200 success
- Webhook Urgente: POST $SERVICE_URL/api/v1/take-a-chef-urgent + header x-webhook-token -> 200 / 401 si token mal
- Lead: POST $SERVICE_URL/api/leads -> 201 success / 200 ignored duplicado / 400 falta campo

Diagnóstico rápido

| Error | Causa | Fix |
|---|---|---|
| 401 en /api/v1/take-a-chef-urgent | WEBHOOK_SECRET_TOKEN no coincide | gcloud secrets versions access latest --secret=WEBHOOK_SECRET_TOKEN --project my-gcp-project-123; asegurar que Cloud Run usa ese secreto |
| WhatsApp no llega | WHATSAPP_API_TOKEN inválido o sin permisos | Revisar logs Cloud Run y verificar token y número en Meta WhatsApp Cloud API; confirmar cuota y templates |
| 500 en /api/leads | Sin permiso Firestore | Asignar roles/datastore.user a la Service Account de Cloud Run: gcloud projects add-iam-policy-binding ... --role=roles/datastore.user |
| Cloud Build falla push | No existe repo Artifact Registry | gcloud artifacts repositories create chefos-api --location=us-central1 --repository-format=docker --project my-gcp-project-123 |

Script automático

```bash
# Ejecutar los tests automáticos (ya incluido en repo)
chmod +x test-deploy.sh
./test-deploy.sh
```

Notas

- No compartas secretos en texto. Usa Secret Manager y da acceso a la Service Account correspondiente.
- Si necesitas que cree el trigger de Cloud Build desde aquí, puedo proporcionarte el comando exacto para ejecutar en tu entorno (no tengo permisos para ejecutarlo por ti). A continuación tienes los comandos finales recomendados para permisos y creación de trigger.

Comandos recomendados (copiar/pegar):

```bash
# 1) Conceder permisos al Service Account de Cloud Build (OBLIGATORIO)
PROJECT_NUMBER=$(gcloud projects describe my-gcp-project-123 --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding my-gcp-project-123 \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding my-gcp-project-123 \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding my-gcp-project-123 \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.writer"

# 2) Crear trigger (si no conectaste GitHub manualmente)
gcloud builds triggers create github \
  --name="chefos-api-main-deploy" \
  --repo-name="chef4y-franko" \
  --repo-owner="ratauille" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --project=my-gcp-project-123 \
  --region=us-central1
```
