# Production audit report

Audited source: `index.html` (the former duplicate `html-index.html` is retained only under `/_backup_html/`), with extracted runtime assets in `assets/css/main.css` and `assets/js/main.js`.

## Findings

| Area | Severity | Finding | Action/status |
|---|---|---|---|
| HTML validity | High | Content and a closing image block existed after `</html>`. | Removed; document now has one document root. |
| HTML validity | Medium | Several labels had no `for` association and form controls lacked stable names. | Added associations/names to booking controls. |
| CSS parsing | High | `/* HOW/* HOW IT WORKS */` was malformed and could consume following rules. | Corrected. |
| CSS maintainability | Medium | Presentation was embedded in a large inline `<style>` block and many `style` attributes. | Moved to `assets/css/main.css` without changing values. |
| JS runtime | High | Inline script extraction retained `</script>` and external execution would fail syntax parsing. | Removed stray tag; `node --check` passes. |
| JS runtime | Medium | Chat and lead requests had no timeout, retry, structured failure logging, or explicit cleanup. | Added bounded retry/backoff, abort timeout, logging, and `finally` cleanup. |
| JS runtime | Medium | Inline handlers made CSP and testing harder. | Replaced with delegated startup bindings/data attributes. |
| i18n | Medium | EN/ES/FR share the same translation key shape, but form validation had only one generic branch and some native option/consent copy remains English. | Added language-specific validation/fallback messages; backend should localize option labels in a future content pass. |
| Accessibility | Medium | Form label associations and chat control names were incomplete. | Improved associations and chat button label. Remaining: keyboard/focus audit, contrast measurement, and dialog semantics. |
| Accessibility | Low | Decorative emoji/icons are exposed as text. | Preserve visual behavior; mark decorative icons `aria-hidden` in a later accessibility-only pass if product approves. |
| SEO | Medium | Canonical existed, but hreflang references and crawler files were missing. | Added consistent query-language hreflang links, `robots.txt`, and `sitemap.xml`. |
| SEO | Medium | Client-side translations are not server-rendered, so search engines may see only EN. | Documented as a backend/SSR dependency. |
| Structured data | Low | JSON-LD is syntactically shaped correctly but should be checked against live business facts and Search Console. | Kept existing schema; deployment validation required. |
| Performance | Medium | Many remote Base44 images and Google Fonts are render-critical or uncached by this repo. | Kept URLs to preserve appearance; lazy loading exists below the fold. CDN optimization/image dimensions remain deployment work. |
| Security | High | Third-party chat endpoint and analytics are trusted directly from the browser; CSP and backend rate limits are required. | Added proposal in `security-headers.md`; use a server-side proxy where possible. |
| Security | Medium | User-controlled WhatsApp name is URL-encoded, but server-side validation/sanitization is unspecified. | Contract and schema docs added. |
| Security | Medium | Privacy/marketing consent links are placeholders. | Backend/legal dependency; do not launch until real policy URL is supplied. |

## Quick validation

- HTML root/closing structure checked by source inspection.
- No inline `style`, `onclick`, `onkeydown`, `onmouseover`, or `onmouseout` attributes remain.
- `assets/js/main.js` passes `node --check`.
- Browser-level console, network, accessibility, and live JSON-LD validation still require a served deployment and browser QA.
