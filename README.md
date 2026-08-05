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

- The public CTA points to pilot-setup.html, which gives two run paths:
	- Shared packaged ZIP/executable flow
	- Source run flow (`python -m streamlit run mvp/app.py`)
- Avoid pointing users directly to private GitHub artifact links as the only run path.

## Deployment

- Production is served from GitHub Pages using the `main` branch.
- Custom domain is configured through `CNAME`.
