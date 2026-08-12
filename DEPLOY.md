# Deploy formulatedprintsapparel.com on Railway

## 1. Create the service

1. In Railway, **New Project → Deploy from GitHub** (or `railway up` from this folder).
2. Railway will use `Dockerfile` + `railway.toml`.
3. Healthcheck path: `/api/health`.

## 2. Environment variables

Copy from `.env.example`:

```
NEXT_PUBLIC_SITE_URL=https://formulatedprintsapparel.com
NEXT_PUBLIC_MOCKUP_APP_URL=https://mockup-app-production.up.railway.app
NEXT_PUBLIC_SHOPIFY_CATALOG_URL=https://formulatedprints.com
RESEND_API_KEY=re_xxx
QUOTE_TO_EMAIL=CustomerService@FormulatedPrints.com
QUOTE_FROM_EMAIL=Formulated Apparel <quotes@your-verified-domain>
```

Without `RESEND_API_KEY`, quote submissions still succeed and log to Railway logs (useful for smoke tests).

## 3. Domain

1. Buy/attach `formulatedprintsapparel.com` to this Railway service.
2. Add `www.formulatedprintsapparel.com` and redirect www → apex (Railway custom domain settings).
3. Wait for DNS / TLS to become active.

## 4. Mockup App

This site talks to the existing Mockup App APIs for config and uploads.

Quote-mode support was added in:

`Mockup App/extensions/mockup-editor/assets/mockup-editor.js`

This Next site also ships a copy at `public/mockup/mockup-editor.js`, so the apparel site works even before you redeploy the Shopify Mockup App.

## 5. Smoke test

1. Open `/` — cream announcement bar, hero, categories.
2. Open `/design` — product list loads from Mockup config + `/api/products`.
3. Submit a contact form on `/contact` — check Resend inbox or Railway logs.
4. Confirm `/sitemap.xml`, `/robots.txt`, `/llms.txt` are public.
