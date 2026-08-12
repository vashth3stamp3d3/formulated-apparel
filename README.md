# Formulated Apparel

SEO/GEO marketing site for **formulatedprintsapparel.com** — company swag, event merch, and custom apparel from Calgary, Alberta, shipping across Canada.

Visual language matches the FormulatedPrints Shopify theme (Outfit, cream/coral/cyan accents). Ordering is **quote-first** via the existing Mockup App designer.

## Stack

- Next.js (App Router) + TypeScript
- Railway Docker deploy (`Dockerfile` + `railway.toml`)
- Resend for quote/contact email
- Mockup App APIs on Railway for config, uploads, and image serving

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Railway deploy

1. Create a new Railway service from this repo.
2. Set environment variables from `.env.example` (especially `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`).
3. Attach custom domain `formulatedprintsapparel.com` (and redirect `www` → apex in Railway/DNS).
4. Health check is `/api/health`.

## Key routes

| Path | Purpose |
|------|---------|
| `/` | Homepage |
| `/company-swag` `/event-swag` `/custom-merch` | Service pages |
| `/design` | Mockup designer + quote |
| `/locations/{canada,alberta,calgary,edmonton}` | GEO pages |
| `/llms.txt` `/sitemap.xml` `/robots.txt` | SEO / GEO helpers |
| `/api/quote` | Quote + contact email |
| `/api/products` | Proxies FormulatedPrints Shopify catalog for garment options |

## Mockup quote mode

The designer ships with `quoteMode: true`. It loads product config from the Mockup App, garment variants from `/api/products`, uploads designs to the Mockup App, then posts a quote payload to `/api/quote` instead of Shopify `/cart/add.js`.

Redeploy the Mockup App if you change `extensions/mockup-editor/assets/mockup-editor.js`, and refresh the copy under `public/mockup/` on this site when needed.
