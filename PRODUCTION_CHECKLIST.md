# Production Checklist

Use this checklist before launching `webutilitydesk.com`.

## Repository

- [ ] Confirm local Git identity:

```bash
git config --local user.name
git config --local user.email
```

- [ ] Stage files:

```bash
git add .
```

- [ ] Create first commit:

```bash
git commit -m "Launch static Web Utility Desk site"
```

- [ ] Add GitHub remote:

```bash
git remote add origin https://github.com/<username>/<repository>.git
```

- [ ] Push to GitHub:

```bash
git push -u origin main
```

## Vercel Deployment

- [ ] Import GitHub repository into Vercel.
- [ ] Set framework preset to `Other`.
- [ ] Leave build command empty.
- [ ] Leave install command empty.
- [ ] Deploy from repository root.
- [ ] Verify home page, tool pages, `robots.txt`, and `sitemap.xml`.

## Cloudflare Deployment

- [ ] Create a Cloudflare Pages project.
- [ ] Connect the GitHub repository.
- [ ] Set framework preset to `None`.
- [ ] Leave build command empty.
- [ ] Deploy from repository root.
- [ ] Enable HTTPS.
- [ ] Verify home page, tool pages, `robots.txt`, and `sitemap.xml`.

## Domain Connection

- [ ] Buy or configure `webutilitydesk.com`.
- [ ] Connect root domain to selected host.
- [ ] Configure `www` redirect behavior.
- [ ] Confirm HTTPS works for:

```text
https://webutilitydesk.com/
https://www.webutilitydesk.com/
```

- [ ] Confirm canonical URLs resolve to the preferred non-`www` domain:

```text
https://webutilitydesk.com/
```

## Google Search Console

- [ ] Add property for `webutilitydesk.com`.
- [ ] Verify ownership using DNS or HTML meta verification.
- [ ] Confirm live URL inspection for the home page.
- [ ] Submit sitemap:

```text
https://webutilitydesk.com/sitemap.xml
```

- [ ] Inspect key tool pages after deployment.

## GA4 Installation

- [ ] Create GA4 property.
- [ ] Create Web data stream for `webutilitydesk.com`.
- [ ] Add the real GA4 Measurement ID to the site head.
- [ ] Verify realtime events in GA4.
- [ ] Do not commit placeholder or fake analytics IDs.

## SEO and AdSense Readiness

- [ ] Confirm all canonical URLs use `https://webutilitydesk.com/.../`.
- [ ] Confirm all sitemap URLs return `200`.
- [ ] Confirm `robots.txt` includes the sitemap URL.
- [ ] Run Google Rich Results Test for tool pages.
- [ ] Run Lighthouse mobile audit.
- [ ] Confirm About, Contact, Privacy Policy, Terms, and Disclaimer pages are live.
- [ ] Apply for AdSense only after production domain and content are live.

