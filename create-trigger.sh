#!/bin/bash
set -e

PROJECT_ID="my-gcp-project-123"
REGION="us-central1"
REPO_NAME="chef4y-franko"
REPO_OWNER="ratauille"
TRIGGER_NAME="chefos-api-main-deploy"

echo "=== SETUP CI/CD CHEFOS-API ==="
echo "Proyecto: $PROJECT_ID"

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "1/4 Dando permisos a Cloud Build SA: $CLOUD_BUILD_SA"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin" --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser" --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.writer" --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor" --quiet

echo "2/4 Verificando repo Artifact Registry..."
gcloud artifacts repositories describe chefos-api --location=$REGION --project=$PROJECT_ID 2>/dev/null || \
gcloud artifacts repositories create chefos-api --repository-format=docker --location=$REGION --project=$PROJECT_ID

echo "3/4 Creando trigger GitHub..."
gcloud builds triggers create github \
  --name=$TRIGGER_NAME \
  --repo-name=$REPO_NAME \
  --repo-owner=$REPO_OWNER \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --project=$PROJECT_ID \
  --region=$REGION 2>&1 || echo "Trigger ya existe o necesita conexión manual en consola"

echo ""
echo "=== LISTO ==="
echo "Haz un push a main para probar:"
echo "git commit --allow-empty -m 'test: trigger CI/CD' && git push origin main"
echo ""
echo "Ver builds: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
