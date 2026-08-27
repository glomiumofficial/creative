# Glomium — static site

Upload the contents of this folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, cPanel).

```
index.html          the page
site.js             scroll animation (vanilla JS, no framework)
assets/
  wordmark-green.png
  favicon.png
```

No build step. `index.html` must sit at the web root with `assets/` and `site.js` beside it.

Editing:
- Brand colors — `--green` / `--green-deep` in the `<style>` block of `index.html`.
- Scroll length — `props.scrollLength` in `site.js` (6.2 = 620vh of scroll).
- Opening zoom on the infinity leg — `props.startZoom` in `site.js`.
- Copy — the `data-el="line"` paragraph, the `data-el="payoff"` line, nav links, footer.
