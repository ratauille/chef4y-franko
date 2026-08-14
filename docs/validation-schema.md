# Server-side validation example

```js
const leadSchema = {
  fullName: { type: 'string', min: 2, max: 160, trim: true },
  email: { type: 'email', max: 254, optional: true },
  phone: { type: 'string', max: 20, pattern: /^[+()\d\s.-]{7,20}$/, optional: true },
  preferredChannel: { enum: ['email', 'whatsapp', 'phone'] },
  experienceType: { enum: ['villa_dinner', 'romantic', 'wedding', 'cooking_class', 'yacht', 'multiday', 'other'] },
  serviceArea: { enum: ['puerto_vallarta', 'punta_mita', 'nuevo_nayarit', 'riviera_nayarit', 'other'] },
  serviceDate: { type: 'date', format: 'YYYY-MM-DD', optional: true },
  guestCount: { type: 'integer', min: 1, max: 500, optional: true },
  message: { type: 'string', max: 2000, optional: true },
  emailMarketing: { type: 'boolean', optional: true },
  lang: { enum: ['en', 'es', 'fr'] },
  privacyConsent: { const: true }, contactConsent: { const: true }
};
```

Reject unknown fields or explicitly allow-list them. Normalize Unicode and whitespace, escape on output, and never build SQL, HTML, email headers, or logs from raw input.
