terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "El ID del proyecto de Google Cloud"
}

variable "region" {
  type        = string
  description = "La región para desplegar los recursos"
  default     = "us-central1"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "artifactregistry_api" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudrun_api" {
  project            = var.project_id
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "firestore_api" {
  project            = var.project_id
  service            = "firestore.googleapis.com"
  disable_on_destroy = false
}

resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.firestore_api]
}

resource "google_artifact_registry_repository" "repo" {
  project       = var.project_id
  location      = var.region
  repository_id = "app-repository"
  format        = "DOCKER"
  description   = "Repositorio Docker para imágenes de Backend y Frontend"

  depends_on = [google_project_service.artifactregistry_api]
}

resource "google_service_account" "backend_sa" {
  project      = var.project_id
  account_id   = "backend-runner-sa"
  display_name = "Service Account para el Backend de Cloud Run"
}

resource "google_project_iam_member" "backend_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_cloud_run_v2_service" "backend" {
  project             = var.project_id
  name                = "backend-service"
  location            = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.backend_sa.email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 8080
      }

      env {
        name  = "PORT"
        value = "8080"
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
    }
  }

  depends_on = [
    google_project_service.cloudrun_api,
    google_firestore_database.database
  ]
}

resource "google_cloud_run_v2_service_iam_member" "backend_public_access" {
  project  = var.project_id
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "artifact_registry_repository_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
  description = "URL del repositorio de Artifact Registry para hacer push a las imágenes Docker"
}

output "backend_service_url" {
  value       = google_cloud_run_v2_service.backend.uri
  description = "URL invocable del servicio Backend de Cloud Run"
}
