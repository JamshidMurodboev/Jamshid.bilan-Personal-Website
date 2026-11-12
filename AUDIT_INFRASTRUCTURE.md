# Audit Infrastructure Report
**Date:** 2026-11-12

---

## Hosting

| Component | Provider | Details |
|---|---|---|
| Web Server | Hetzner VPS | 204.168.136.232 |
| Process Manager | PM2 | Process: `jamshidbilan` |
| VPS Path | — | `/var/www/Jamshid.bilan-Personal-Website` |
| Node.js | — | LTS |
| Domain | — | jamshidbilan.uz |

**VPS Status:** ✅ Running — PM2 process confirmed active after deploy

---

## Database

| Component | Provider | Details |
|---|---|---|
| Database | Supabase | PostgreSQL |
| Auth | Supabase Auth | Phone-based (SMS via Telegram OTP) |
| Storage | Supabase Storage | User avatars, result photos |
| RLS | Supabase RLS | Enabled on all user-facing tables |

**Key tables:**
- `page_views` — analytics tracking
- `bookings` — consultation bookings
- `telegram_otp_sessions` — OTP auth flow
- `news_posts` — news content
- `scholarships` — scholarship listings
- `universities` — university listings
- `resources` — downloadable files

---

## External Services

| Service | Purpose | Status |
|---|---|---|
| Groq AI | Translation (admin) | ✅ Model: `openai/gpt-oss-120b` |
| Telegram Bot | Booking notifications + OTP auth | ✅ Webhook configured |
| Resend | Email verification | ⚠️ Sandbox sender (see note) |
| Google Analytics | Traffic tracking | ✅ G-TPFHNX4SWG |

**Resend Note:** Currently using `onboarding@resend.dev` (sandbox sender). For production, verify a custom domain in Resend and set `RESEND_FROM=noreply@jamshidbilan.uz`.

---

## Environment Variables

All required variables documented in `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # Server-side only
NEXT_PUBLIC_SITE_URL
GROQ_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
TELEGRAM_ADMIN_CHAT_ID
TELEGRAM_WEBHOOK_SECRET
RESEND_API_KEY
```

---

## CI/CD

| Component | Status | Notes |
|---|---|---|
| GitHub Actions workflow | ✅ Created | `.github/workflows/deploy.yml` |
| VPS_HOST secret | ⚠️ Pending | Must be set in GitHub repo settings |
| VPS_USER secret | ⚠️ Pending | Must be set in GitHub repo settings |
| VPS_SSH_KEY secret | ⚠️ Pending | Must be set in GitHub repo settings |

**To set GitHub secrets:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add `VPS_HOST` = `204.168.136.232`
3. Add `VPS_USER` = your SSH username (e.g. `root` or `deploy`)
4. Add `VPS_SSH_KEY` = your private SSH key content

---

## Security Headers

All headers verified present via `next.config.mjs`:

| Header | Value |
|---|---|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| Content-Security-Policy | Full policy (see next.config.mjs) |
| X-Frame-Options | `SAMEORIGIN` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` |

---

## Google Analytics & Search Console

- **GA4 Property:** G-TPFHNX4SWG
- **Implementation:** `next/script` with `afterInteractive` strategy on root layout
- **Search Console:** Verify via GA4 property or DNS TXT record if not done yet
