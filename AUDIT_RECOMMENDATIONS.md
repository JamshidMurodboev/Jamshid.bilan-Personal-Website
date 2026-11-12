# Audit Recommendations
**Date:** 2026-11-12

Actionable next steps, ordered by priority.

---

## Priority 1 — Do Now

### 1. Set GitHub Actions Secrets
Required for auto-deploy to work on push to `main`.

**Steps:**
1. GitHub repo → Settings → Secrets and variables → Actions
2. Add: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

### 2. Fix Resend Sender Domain
Emails currently send from `onboarding@resend.dev` (Resend sandbox), which may land in spam and shows unprofessional branding.

**Steps:**
1. Add `jamshidbilan.uz` as a verified domain in Resend dashboard
2. Add required DNS records (MX, DKIM, SPF) to domain registrar
3. Update `.env` on VPS: `RESEND_FROM=noreply@jamshidbilan.uz`
4. Update `src/app/api/send-verification/route.ts` line 81: change `from` value

---

## Priority 2 — Do Soon

### 3. Replace `<img>` with `<Image />` (3 locations)
Improves LCP (Largest Contentful Paint) and reduces bandwidth.

| File | Line | Notes |
|---|---|---|
| `src/components/layout/Header.tsx` | 151 | User avatar — use `<Image>` with `unoptimized` if URL is dynamic |
| `src/components/profile/ProfileContent.tsx` | 135 | Profile photo |
| `src/components/results/ResultPhotoGallery.tsx` | 71 | Gallery thumbnails |

### 4. Upgrade to Next.js 15
Fixes 18 open CVEs. Next.js 15 has breaking changes but the upgrade path is well-documented.

**Key breaking changes to handle:**
- `params` and `searchParams` are now Promises in layouts/pages
- `cookies()` and `headers()` are async
- `fetch` caching behavior changed

**Upgrade command:**
```bash
npm install next@15 react@19 react-dom@19
npx @next/codemod@canary upgrade latest
```

### 5. Add Supabase Google Search Console Verification
If not done, verify site ownership in Google Search Console using the HTML meta tag method on the root layout.

---

## Priority 3 — Nice to Have

### 6. Add `loading.tsx` Files
Currently missing loading UI for dynamic routes. Add skeleton screens for:
- `/[locale]/news`
- `/[locale]/universities`
- `/[locale]/scholarships`
- `/[locale]/resources`

### 7. Add Sitemap Dynamic Routes
Current `sitemap.xml` is static. Add dynamic sitemap generation for news posts and scholarships using `src/app/sitemap.ts`.

### 8. Add `webVitals` Reporting
Connect Core Web Vitals to Google Analytics:
```ts
// src/app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  gtag('event', metric.name, { value: Math.round(metric.value), ... });
}
```

### 9. Consider Rate Limiting on API Routes
High-traffic endpoints like `/api/booking/create` and `/api/contact` have no rate limiting. Consider adding Upstash Redis rate limiter or Cloudflare WAF rules.

### 10. Add `<StructuredData>` (JSON-LD)
Add schema.org `Person` and `WebSite` JSON-LD to the root layout for better rich snippets in search results.

---

## Security Hardening Checklist

- [x] Admin routes require dual auth (session + cookie)
- [x] HSTS enabled
- [x] CSP header set
- [x] No service role key in client code
- [x] Open redirect closed
- [x] HTML injection in Telegram prevented
- [x] Telegram webhook secret enforced
- [ ] Rate limiting on booking/contact endpoints
- [ ] Cloudflare proxy (would add DDoS protection + WAF)
- [ ] Regular Supabase backup schedule confirmed
