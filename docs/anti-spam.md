# Anti-spam strategy

Use layered controls: honeypot (`_hp`), minimum submit time, per-IP and per-contact rate limits, duplicate/idempotency detection, server-side CAPTCHA only when risk is high, and email/phone reputation checks. Store hashed IP/user-agent with a short retention period, alert on spikes, and return the same neutral response for suspicious requests. Never rely on the honeypot or browser validation alone.
