# Utmostconnect.github.io

Utmost Connect public website (GitHub Pages).

## Local preview

From the repository root:

```powershell
py -3 -m http.server 5500
```

Then open:

- http://localhost:5500/

## Primary pages

- Main site: index.html
- Engineering Intelligence (canonical): engineering-intelligence.html
- Legacy typo redirect (kept for compatibility): engineerig-intelligence.html
- Pilot setup guide: pilot-setup.html
- ClearPath QMS subpage: ClearPath QMS/index.html
- AI & Data Engineering subpage: ai-data-engineering.html

## Pilot distribution notes

- The public CTA points to pilot-setup.html and uses packaged ZIP/executable distribution only.
- Source code links are intentionally removed from the public pilot flow.

## Server-side protection

- Sensitive logic and secrets must run server-side only (Cloudflare Worker API routes).
- Frontend pages should call `/api/*` endpoints and never embed API keys, model tokens, or private prompts.
- The Worker in `src/worker.js` proxies requests to a private backend and injects authorization server-side.

Set required Worker secrets before deploy:

```powershell
wrangler secret put ENGINEERING_INTELLIGENCE_BACKEND_URL
wrangler secret put ENGINEERING_INTELLIGENCE_BACKEND_TOKEN
```

Optional origin policy is configured in `wrangler.jsonc` via `ALLOWED_ORIGINS`.

## Deployment

- Production is served from GitHub Pages using the `main` branch.
- Custom domain is configured through `CNAME`.
