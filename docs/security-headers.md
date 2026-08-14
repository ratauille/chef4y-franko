# Security headers and CSP proposal

Set at the edge/server:

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https://base44.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://base44.app; form-action 'self'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Remove `unsafe-inline` after all inline handlers/styles are confirmed absent and use nonces/hashes for any unavoidable inline analytics bootstrap. Confirm every Base44 image/API host and Google Analytics requirement before enforcement. Sanitize and encode all input at the server boundary and escape any value rendered into HTML.
