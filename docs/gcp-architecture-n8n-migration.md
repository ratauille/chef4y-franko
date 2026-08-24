# ChefOS: migración de 17 workflows de n8n a GCP

## Arquitectura objetivo

El panel React consume una API en Cloud Run. La API usa Firestore para leads, cotizaciones y reservas. Secret Manager guarda credenciales. Cloud Scheduler sustituye los cron de n8n y Cloud Workflows coordina procesos multi-paso. Cloud Tasks controla reintentos, velocidad y trabajos masivos.

```text
React/Vite -> Cloud Run API (Fastify)
                 |-> Firestore (CRM operativo)
                 |-> Workflows (orquestación)
                 |-> Cloud Tasks (async/retries)
                 |-> Secret Manager (secretos)
Cloud Scheduler -> Cloud Run / Workflows
Firestore events -> Eventarc -> Workflows
```

## Migración por fases

1. Inventario: documentar cada workflow, entradas, salidas, credenciales, cron y manejo de errores.
2. CRM: leads, cotizaciones, reservas y estados; mantener Firestore como fuente operativa.
3. Automatización diaria: Scheduler + endpoints idempotentes en Cloud Run.
4. AI Agents e Intelligence: separar llamadas de modelos en jobs o servicios con límites de costo.
5. Control y errores: logs estructurados, alertas, retries con backoff, dead-letter queues y correlation IDs.
6. Corte gradual: ejecutar n8n y GCP en paralelo, comparar resultados y retirar cada workflow solo después de validar métricas.

## Convenciones de la API

- `GET /api/crm/leads`, `/quotes`, `/reservations`
- `POST /api/crm/leads` con `Idempotency-Key`
- `GET /api/dashboard/metrics`
- `POST /api/workflows/:workflowName/executions`
- Todas las escrituras validan esquema y registran `created_at`, `updated_at` y `correlation_id`.

## Decisión inicial

Fastify es la capa HTTP de la migración porque permite módulos pequeños y validación de esquemas. Express/Vertex permanece temporalmente para compatibilidad; ambos deben unificarse antes de desplegar producción. No se debe migrar los 17 workflows de una sola vez.
