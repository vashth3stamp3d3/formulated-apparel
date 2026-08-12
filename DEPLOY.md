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

## 4. Mockup App (keep `/design` in sync)

`/design` loads the editor **live from Mockup App Railway** (not the local
`public/mockup/` copies):

- JS: `{MOCKUP_APP_URL}/api/mockup-editor-js?v=…`
- CSS: `{MOCKUP_APP_URL}/api/mockup-editor-css?v=…`
- Config / upload / products: same Railway host
- Checkout: cart permalink → `NEXT_PUBLIC_SHOPIFY_CATALOG_URL` (formulatedprints.com)

When you ship Mockup App editor changes:

1. `railway up` the Mockup App (serves fresh JS/CSS).
2. Bump `EDITOR_ASSET_VERSION` in `src/components/MockupDesigner.tsx` if browsers
   may cache an older `?v=` (optional when Railway sends `Cache-Control: no-store`).
3. Redeploy this apparel site only if the React shell / embed config changed.

Local `public/mockup/*` files are legacy fallbacks and are no longer used by
`MockupDesigner`.

## 5. Smoke test

1. Open `/` — cream announcement bar, hero, categories.
2. Open `/design` — product list loads from Mockup config + Railway `/api/shopify-products`.
3. Add to cart → lands on formulatedprints.com cart with mockup properties.
4. Submit a contact form on `/contact` — check Resend inbox or Railway logs.
5. Confirm `/sitemap.xml`, `/robots.txt`, `/llms.txt` are public.
