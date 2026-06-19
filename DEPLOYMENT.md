# Deployment Guide

Web Utility Desk is a static website. Deploy the repository root as the site output. No framework build step is required.

## Pre-Deployment Checks

Run these from the project root:

```bash
node --check assets/app.js
xmllint --noout sitemap.xml
python3 -m http.server 5174
```

Then open:

```text
http://localhost:5174
```

Confirm:

- Home page loads.
- Every tool page loads.
- `robots.txt` loads.
- `sitemap.xml` loads.
- Tool buttons work in the browser.

## GitHub

1. Create a new GitHub repository.
2. Keep it public if you want simple portfolio visibility, or private if you want to control access before launch.
3. Add the remote:

```bash
git remote add origin https://github.com/<username>/<repository>.git
```

4. Stage and commit:

```bash
git add .
git commit -m "Launch static Web Utility Desk site"
```

5. Push:

```bash
git push -u origin main
```

## Vercel

Use Vercel as a static deployment target.

1. Import the GitHub repository into Vercel.
2. Framework preset: `Other`.
3. Build command: leave empty.
4. Output directory: leave empty or use `.` if Vercel asks for a directory.
5. Install command: leave empty.
6. Deploy.
7. Add the production domain `webutilitydesk.com`.
8. Configure DNS records exactly as Vercel shows.
9. After DNS resolves, verify:

```text
https://webutilitydesk.com/
https://webutilitydesk.com/sitemap.xml
https://webutilitydesk.com/robots.txt
```

## Cloudflare Pages

Use Cloudflare Pages as a static deployment target.

1. Create a Cloudflare Pages project.
2. Connect the GitHub repository.
3. Framework preset: `None`.
4. Build command: leave empty.
5. Build output directory: `/` or project root, depending on Cloudflare UI wording.
6. Deploy.
7. Add the custom domain `webutilitydesk.com`.
8. Let Cloudflare configure DNS automatically, or add the required records manually.
9. Enable HTTPS.
10. Verify:

```text
https://webutilitydesk.com/
https://webutilitydesk.com/sitemap.xml
https://webutilitydesk.com/robots.txt
```

## Post-Deployment

1. Add Google Search Console verification.
2. Submit:

```text
https://webutilitydesk.com/sitemap.xml
```

3. Add GA4 only after the real Measurement ID is available.
4. Run Lighthouse on mobile and desktop.
5. Test structured data with Google Rich Results Test.
6. Apply for AdSense only after the domain, privacy pages, and useful tool content are live.

