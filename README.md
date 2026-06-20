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
- Lorem Ipsum generator
- Case converter
- Text diff checker
- QR scanner
- Responsive layout for desktop and mobile
- GA4 analytics loaded through the shared `assets/analytics.js` loader
- Official AdSense loader included globally on every HTML page
- Canonical URLs, Open Graph metadata, and structured data on content pages

## Analytics Architecture

Analytics is centralized in `assets/analytics.js`.

- The GA4 Measurement ID is defined once in the shared loader: `G-SNHJ9F5044`
- Every page loads the same shared script
- Page view tracking is dispatched from the loader, not from page-local code
- Duplicate initialization is guarded so the loader can be included safely once per page

The implementation rule is simple: do not add GA4 snippets, inline `gtag()` calls, or page-specific analytics bootstrap logic to HTML files. If analytics behavior changes, update `assets/analytics.js` only.

## AdSense Architecture

AdSense is wired through the shared HTML head pattern so every current page receives the same loader once.

- Publisher ID: `ca-pub-8988449511803364`
- Official loader: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8988449511803364`
- `ads.txt` location: `/ads.txt`
- `ads.txt` line: `google.com, pub-8988449511803364, DIRECT, f08c47fec0942fa0`

Rules for future pages:

1. Copy the shared head structure from an existing page.
2. Include the official AdSense loader exactly once.
3. Keep the loader alongside the shared analytics script so new pages inherit the same monetization setup.
4. Do not add page-specific AdSense variants or duplicate loader tags.
5. Keep `ads.txt` at the repository root so it deploys to `https://webutilitydesk.com/ads.txt`.

## How To Add New Pages

Use the existing HTML pages as the source of truth for new content pages.

1. Copy the shared `<head>` pattern from an existing page.
2. Include `assets/analytics.js`.
3. Add a canonical URL.
4. Add Open Graph and Twitter metadata.
5. Add structured data where it makes sense for the page type.
6. Add internal links to the matching tool pages and related articles.
7. Update the relevant hub page and `sitemap.xml`.

## Required Shared Assets

Always include these shared assets on new pages:

- `assets/styles.css`
- `assets/analytics.js`
- `assets/favicon.svg`
- `assets/apple-touch-icon.svg`
- `assets/site.webmanifest`
- `assets/og-image.svg`

## SEO Checklist

- Canonical URL is present and correct
- Title is descriptive and unique
- Meta description is concise and specific
- Open Graph title, description, image, and URL are present
- Twitter card metadata is present
- Internal links point to related tools and related articles
- Structured data is valid JSON-LD
- Page is added to `sitemap.xml`

## Analytics Checklist

- `assets/analytics.js` is included once
- No inline GA4 code exists in the HTML
- Measurement ID is loaded from the shared loader
- Page view tracking is sent once per page load
- Duplicate initialization is prevented

## Contributor Rule

Every new page must include analytics.js, favicon assets, canonical URL, Open Graph metadata, and structured data where appropriate.

## Next.js Migration Path

The site is intentionally static today, but the current structure is compatible with a future Next.js migration.

- Keep route slugs stable
- Preserve the shared metadata pattern
- Reuse the current content clusters: tools, blog, guides, resources, and legal pages
- Replace the static `<head>` pattern with a shared metadata helper when the migration begins
- Keep `assets/analytics.js` as the shared analytics source until the app shell is rebuilt
- Avoid page-level duplication of canonical, social, and schema markup

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
8. Keep analytics configuration in `assets/analytics.js` so the GA4 ID stays centralized.

Detailed deployment steps are in [DEPLOYMENT.md](./DEPLOYMENT.md). The launch checklist is in [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

## Suggested Next Steps

1. Buy and configure `webutilitydesk.com`.
2. Keep GA4 and search console configuration in the shared loader and deployment setup.
3. Publish five more high-search-intent tools before adding accounts or SaaS features.
4. Add AdSense only after the site has enough useful content and crawlable pages.
