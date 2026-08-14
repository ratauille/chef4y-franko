# `POST /api/leads` contract

Request: `Content-Type: application/json`.

Required: `fullName`, `preferredChannel`, `experienceType`, `serviceArea`, `lang`, and both consent flags (`privacyConsent`, `contactConsent`). At least one of `email` or `phone` is required; the preferred channel must have its matching contact value.

Optional: `serviceDate` (`YYYY-MM-DD`), `guestCount` (1–500), `message` (0–2000 chars), `emailMarketing` (boolean), `source`.

Success: `201 {"id":"...","status":"received"}`. Validation failure: `400 {"error":"validation_error","fields":{"email":"invalid"}}`. Rate limit: `429`. Temporary failure: `503`.

The endpoint must authenticate/authorize its own abuse controls, validate JSON server-side, persist an audit-safe record, avoid returning secrets, and support an idempotency key such as `Idempotency-Key`.
