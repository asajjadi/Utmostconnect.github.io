# Utmostconnect.github.io

Utmost Connect public website (GitHub Pages).

## Shared layout system

Production already builds through Jekyll on every push to `main` (see
`.github/workflows/jekyll-gh-pages.yml` -- the unmodified GitHub-provided
Jekyll Pages workflow). Pages that opt in to it via YAML front matter
(`---\nlayout: base\n...\n---` at the top of the file) get rendered through
`_layouts/base.html`, which owns the shared token/type system, `<head>`
boilerplate, and the nav/footer chrome from `_includes/nav.html` and
`_includes/footer.html` -- edit those three files to change something
site-wide. Pages *without* front matter (most of them, still) are left
completely alone and served as raw static HTML, exactly as before -- Jekyll
only processes a file if it starts with `---`. Migrate a page onto the
shared layout by adding front matter and moving its `<head>`/nav/footer
markup into (or out to) the layout; see `index.html` for a migrated example
and `pilot-setup.html` for an unmigrated one.

Current front-matter variables `_layouts/base.html` understands:
`layout`, `title`, `description`, `og_image`, `theme` (`"dark"`/`"light"`
to force a theme instead of following the OS preference).

## Local preview

Real Jekyll isn't installed locally in this environment (no Ruby), so
`tools/render_preview.py` approximates the production build with Python
instead (`pip install -r tools/requirements.txt` once) -- it resolves front
matter, layouts, and `{% include %}` well enough for visual review, but
isn't a byte-for-byte stand-in for the real `actions/jekyll-build-pages`
step that actually deploys. Final verification is always the real build on
push.

```powershell
py -3 tools\render_preview.py
py -3 -m http.server 5500 --directory _preview
```

Then open http://localhost:5500/. Re-run the render script after editing
any page, `_layouts/base.html`, or an `_includes/*.html` file.

For a page with no front matter, plain `py -3 -m http.server 5500` from the
repo root (no render step) still works exactly as before.

## Primary pages

- Main site: index.html (migrated onto the shared layout)
- Engineering Intelligence (canonical): engineering-intelligence.html
- Legacy typo redirect (kept for compatibility): engineerig-intelligence.html
- Pilot setup guide: pilot-setup.html
- ClearPath QMS subpage: ClearPath QMS/index.html
- AI & Data Engineering subpage: ai-data-engineering.html
- Investor deck (mirrors `Investor_Deck.html` from the engineering-intelligence repo): Investor_Deck/index.html

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
