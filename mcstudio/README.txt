Skin Studio — static web build
==============================

Built with base URL: /mcstudio/
Public site URL: (not set — re-run with STUDIO_SITE_URL=https://your.domain for full SEO)

Upload the *contents* of this folder to any static host
(Netlify, Cloudflare Pages, GitHub Pages, S3, nginx, …).

- Paint, layers, templates, share links, and download-save work in the browser.
- Texture-pack browsing uses the content-addressed pack in vendor/ (Range-streamed).
- Importing a player skin by Mojang/mcskin name needs the desktop app.
- SEO: robots.txt, sitemap.xml, Open Graph, and JSON-LD are included.
  Set STUDIO_SITE_URL to your https origin so canonical/OG URLs are absolute.

Local smoke check:

  npx --yes serve -s .
  # then open the printed URL
