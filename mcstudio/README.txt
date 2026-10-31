Skin Studio — static web build
==============================

Built with base URL: /mcstudio/

Upload the *contents* of this folder to any static host
(Netlify, Cloudflare Pages, GitHub Pages, S3, nginx, …).

- Paint, layers, templates, share links, and download-save work in the browser.
- Importing a PNG from disk / Mojang / mcskin.me needs the desktop app
  (browser preview has no native file/network bridge).
- Texture-pack browsing needs local vendor assets (desktop, or `pnpm dev`).

Local smoke check:

  npx --yes serve -s .
  # then open the printed URL
