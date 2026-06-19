# Web Utility Desk

Web Utility Desk is a static starter for a long-term tools website focused on organic search, AdSense potential, affiliate content, and future SaaS expansion.

## Current Scope

- SEO-ready home page metadata
- Browser-only utility workspace
- Dedicated SEO pages for core developer tools
- JSON formatter and minifier
- JSON validator
- Base64 encoder and decoder
- URL encoder and decoder
- UUID generator
- Timestamp converter
- Password generator
- Hash generator
- JWT decoder
- QR code generator
- Slug generator
- Responsive layout for desktop and mobile

## Run Locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 5174
```

Then visit:

```text
http://localhost:5174
```

## Deployment

This is a static website. Deploy the repository root as the production site. No framework migration, dependency install, or build step is required.

Recommended launch flow:

1. Push this repository to GitHub.
2. Deploy the repository root with Vercel or Cloudflare Pages.
3. Connect `webutilitydesk.com`.
4. Verify `https://webutilitydesk.com/robots.txt`.
5. Verify `https://webutilitydesk.com/sitemap.xml`.
6. Add Google Search Console verification.
7. Submit the sitemap in Search Console.
8. Add GA4 only after the real Measurement ID is available.

Detailed deployment steps are in [DEPLOYMENT.md](./DEPLOYMENT.md). The launch checklist is in [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

## Suggested Next Steps

1. Buy and configure `webutilitydesk.com`.
2. Add analytics and search console after hosting is selected.
3. Publish five more high-search-intent tools before adding accounts or SaaS features.
4. Add AdSense only after the site has enough useful content and crawlable pages.
