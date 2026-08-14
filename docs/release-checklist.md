# Production release checklist

- [ ] Deploy `/api/leads` with schema, rate limiting, idempotency, monitoring, and alerting.
- [ ] Configure security headers/CSP in report-only, then enforce after staging verification.
- [ ] Supply real privacy-policy URL and verify consent storage/retention.
- [ ] Verify all image/font/API URLs, HTTPS, DNS, canonical, hreflang, robots, sitemap, and Search Console.
- [ ] Run the QA matrix, Lighthouse, axe, HTML, CSS, JS, and JSON-LD checks.
- [ ] Confirm analytics consent/legal configuration and no secrets in browser source.
- [ ] Test rollback, error pages, backups, log redaction, and post-release smoke tests.
