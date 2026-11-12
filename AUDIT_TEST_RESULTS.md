# Audit Test Results
**Date:** 2026-11-12

---

## TypeScript

```
npx tsc --noEmit
```
**Result: ✅ 0 errors**

---

## ESLint

```
npm run lint
```
**Result: ✅ No errors — 3 warnings (acceptable)**

| Warning | File | Notes |
|---|---|---|
| `<img>` instead of `<Image />` | `Header.tsx:151` | Dynamic avatar URL — acceptable |
| `<img>` instead of `<Image />` | `ProfileContent.tsx:135` | User-uploaded photo — acceptable |
| `<img>` instead of `<Image />` | `ResultPhotoGallery.tsx:71` | Gallery thumbnails — acceptable |

---

## Production Build

```
npm run build
```
**Result: ✅ Build succeeded**

- 73 static pages generated
- 0 build errors
- All API routes compile correctly
- Middleware compiles (92.9 kB)

**Key pages:**
- `/uz` (home) — static
- `/uz/scholarships` — static  
- `/uz/universities` — dynamic
- `/uz/news` — dynamic
- `/uz/resources` — dynamic (auth-gated)
- `/uz/booking` — dynamic
- All admin routes — dynamic

---

## Translation Completeness

All 3 locale files (uz/ru/en) checked for key parity.

**Result: ✅ 0 missing keys**

Namespaces verified:
- `common`, `nav`, `hero`, `about`, `contact`, `booking`, `scholarships`, `universities`, `results`, `news`, `resources`, `admin`, `auth`, `profile`

---

## Security Checks

| Check | Result |
|---|---|
| Admin API routes require auth | ✅ |
| callbackUrl restricted to relative paths | ✅ |
| Telegram HTML injection prevented | ✅ |
| HSTS header present | ✅ |
| CSP header present | ✅ |
| httpOnly on visitor cookie | ✅ |
| Service role key server-side only | ✅ |
| Telegram webhook secret enforced | ✅ |

---

## npm Audit

```
npm audit
```
**Result: 18 vulnerabilities (7 moderate, 11 high)**

All are in `next` package itself — require Next.js v15 upgrade.  
Non-breaking patches applied via `npm audit fix`.

---

## Route Analysis

| Route | Auth Required | Method | Notes |
|---|---|---|---|
| `/api/booking/create` | No | POST | Public form submission |
| `/api/contact` | No | POST | Public contact form |
| `/api/admin/analytics` | ✅ admin cookie | GET | Protected |
| `/api/admin/translate` | ✅ admin cookie | POST | Protected |
| `/api/auth/login` | No | POST | Public auth |
| `/api/auth/signup` | No | POST | Public auth |
| `/api/telegram/webhook` | ✅ webhook secret | POST | Protected |
| `/api/track-visit` | No | POST | Analytics tracking |
| `/api/send-verification` | No | POST | Email verification |
