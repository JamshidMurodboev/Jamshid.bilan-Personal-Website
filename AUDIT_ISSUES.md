# Audit Issues Log
**Date:** 2026-11-12

All issues found and their resolution status.

---

## CRITICAL (Fixed)

### SEC-001 — Unprotected Admin API Routes
- **File:** `src/app/api/admin/analytics/route.ts`, `src/app/api/admin/translate/route.ts`
- **Issue:** Routes were fully public — no auth check at all
- **Fix:** Added `admin_logged_in` cookie check returning 401 if absent
- **Status:** ✅ Fixed

### SEC-002 — Open Redirect in callbackUrl
- **File:** `src/components/layout/Header.tsx:204`
- **Issue:** `router.push(callbackUrl)` accepted absolute URLs — attacker could redirect to phishing site
- **Fix:** Added check `callbackUrl.startsWith('/')` before redirect
- **Status:** ✅ Fixed

### SEC-003 — HTML Injection in Telegram Messages
- **File:** `src/app/api/booking/create/route.ts`
- **Issue:** User-supplied name/phone/topic included directly in Telegram HTML messages
- **Fix:** Added `escapeHtml()` function, applied to all user fields
- **Status:** ✅ Fixed

### SEC-004 — Resources Page Not Auth-Guarded Server-Side
- **File:** `src/app/[locale]/resources/page.tsx`
- **Issue:** Page showed protected content without server-side auth check
- **Fix:** Added `createClient().auth.getUser()` check with redirect to sign-in
- **Status:** ✅ Fixed

### SEC-005 — Missing HSTS Header
- **File:** `next.config.mjs`
- **Issue:** No Strict-Transport-Security header — downgrade attacks possible
- **Fix:** Added `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **Status:** ✅ Fixed

### SEC-006 — Missing Content-Security-Policy
- **File:** `next.config.mjs`
- **Issue:** No CSP header — XSS attacks unrestricted
- **Fix:** Added full CSP header with appropriate directives
- **Status:** ✅ Fixed

### SEC-007 — Telegram Webhook Accepts All Requests Without Secret
- **File:** `src/app/api/telegram/webhook/route.ts`
- **Issue:** If WEBHOOK_SECRET not set in production, webhook accepted any request
- **Fix:** Added production check — returns 403 if secret is not configured
- **Status:** ✅ Fixed

### SEC-008 — track-visit Cookie httpOnly=false
- **File:** `src/app/api/track-visit/route.ts`
- **Issue:** visitor_id cookie was readable by JavaScript (XSS risk)
- **Fix:** Set `httpOnly: true`
- **Status:** ✅ Fixed

---

## HIGH (Fixed)

### BUILD-001 — Module-Level Supabase Client Init (14 routes)
- **Files:** All API routes
- **Issue:** `const supabase = createClient(...)` at module top level crashes build when env vars absent
- **Fix:** Moved inside handler functions in all 14 affected routes
- **Status:** ✅ Fixed (commit bd52203)

### BUILD-002 — Module-Level Resend Client Init
- **File:** `src/app/api/send-verification/route.ts`
- **Issue:** `new Resend(process.env.RESEND_API_KEY)` at module level throws during build
- **Fix:** Moved inside POST handler
- **Status:** ✅ Fixed

### BUILD-003 — telegram/status Missing force-dynamic
- **File:** `src/app/api/telegram/status/route.ts`
- **Issue:** Next.js tried to statically export dynamic GET route
- **Fix:** Added `export const dynamic = 'force-dynamic'`
- **Status:** ✅ Fixed

### BUILD-004 — Broken /blog Redirect
- **File:** `next.config.mjs`
- **Issue:** `/blog` returned 404 (page doesn't exist)
- **Fix:** Added redirect `/blog` → `/uz/news`
- **Status:** ✅ Fixed

---

## MEDIUM (Fixed)

### I18N-001 — BookingModal Hardcoded Locale-Conditional Strings
- **File:** `src/components/shared/BookingModal.tsx`
- **Issue:** 6 labels used inline `locale === 'ru' ? '...' : locale === 'en' ? '...' : '...'` patterns
- **Fix:** Switched to `useTranslations('booking')` — booking namespace already had all keys
- **Status:** ✅ Fixed

### I18N-002 — Missing sectionLabel Keys
- **Files:** `messages/uz.json`, `messages/ru.json`, `messages/en.json`
- **Issue:** AboutSection and HomeContactSection showed hardcoded "About" / "Konsultatsiya"
- **Fix:** Added `sectionLabel` to contact and about namespaces in all 3 locales
- **Status:** ✅ Fixed

### SEO-001 — Missing generateMetadata on news/page.tsx
- **File:** `src/app/[locale]/news/page.tsx`
- **Issue:** Server component page had no SEO metadata
- **Fix:** Added `generateMetadata()` with locale-aware titles and descriptions
- **Status:** ✅ Fixed

### SEO-002 — Missing generateMetadata on resources/page.tsx
- **File:** `src/app/[locale]/resources/page.tsx`
- **Issue:** No metadata exported
- **Fix:** Added `generateMetadata()` with `robots: { index: false }` (gated content)
- **Status:** ✅ Fixed

### UX-001 — Missing type="button" on Non-Submit Buttons
- **File:** `src/components/shared/BookingModal.tsx`
- **Issue:** Buttons inside `<form>` without explicit type default to `type="submit"`, causing unintended form submissions
- **Fix:** Added `type="button"` to close button and success OK button
- **Status:** ✅ Fixed

### UX-002 — Translation Model Deprecated
- **File:** `src/app/api/admin/translate/route.ts`
- **Issue:** llama-3.3-70b-versatile decommissioned by Groq
- **Fix:** Switched to `openai/gpt-oss-120b`, added `<think>` token stripping
- **Status:** ✅ Fixed

### UX-003 — toUpperCase Crash on Users Page
- **File:** Admin users page
- **Issue:** `(user.full_name || user.email || '?')[0].toUpperCase()` crashed when both are empty string
- **Fix:** `((user.full_name || user.email || '?')[0] ?? '?').toUpperCase()`
- **Status:** ✅ Fixed

---

## LOW (Fixed)

### INFRA-001 — No GitHub Actions CI/CD
- **Fix:** Created `.github/workflows/deploy.yml` for auto-deploy on push to main
- **Status:** ✅ Created (GitHub secrets must be set manually)

### PERF-001 — Analytics Route Loading All Rows
- **File:** `src/app/api/admin/analytics/route.ts`
- **Fix:** Capped to 10k rows, added RPC-first path
- **Status:** ✅ Fixed

### ERROR-001 — Missing Global Error Boundary
- **Fix:** Created `src/app/error.tsx` and `src/app/[locale]/error.tsx`
- **Status:** ✅ Fixed

### ERROR-002 — Missing 404 Page
- **Fix:** Created `src/app/not-found.tsx`
- **Status:** ✅ Fixed

---

## OPEN (Requires Decision)

### DEP-001 — 18 npm Vulnerabilities in Next.js
- **Severity:** Medium (requires Next.js v15 upgrade — breaking changes)
- **Action:** See AUDIT_RECOMMENDATIONS.md

### INFRA-002 — Resend Sandbox Sender
- **Issue:** Emails sent from `onboarding@resend.dev` (sandbox) in production
- **Action:** Verify custom domain in Resend, update `RESEND_FROM` env var

### INFRA-003 — GitHub Actions Secrets Not Set
- **Action:** Set `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` in GitHub repository secrets
