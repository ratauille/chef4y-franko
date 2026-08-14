# QA checklist

| Matrix | Checks |
|---|---|
| Desktop/mobile | Chrome, Safari, Firefox; 320px, 768px, 1440px; nav, gallery, booking and chat remain visually unchanged. |
| EN/ES/FR | Switch language, reload with `?lang=`, verify every `data-k` key and validation/success/fallback message. |
| Form | Required fields, invalid email/phone, preferred-channel mismatch, honeypot, consent, success, 400/429/503, timeout and retry. |
| Chat | Empty/duplicate sends, chip sends, concurrent clicks, timeout, 5xx retry, offline fallback, restored button state. |
| Slow network | Throttle 3G; confirm no layout break, bounded waits, and no unhandled promise errors. |
| No JS | HTML remains readable; native form posts to `/api/leads` only after backend accepts the named fields. Language/chat/calculator enhancements are unavailable by design. |

Use browser DevTools, Lighthouse, axe, HTML validator, structured-data validator, and a real staging API before release.
