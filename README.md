# Bhunganeh Funerals — website

Plain HTML/CSS/JS, no build step. See `styles/main.css` for the responsive
stylesheet (breakpoints at 700px and 1024px) and `scripts/main.js` for the
WhatsApp/quote-composer logic.

## Structure

```
index.html       Home page
services.html    Services page
404.html         Custom 404
styles/main.css  Shared stylesheet
scripts/main.js  Shared behavior
assets/          Images
.htaccess        Apache config (HTTPS redirect, caching, gzip) for GoDaddy-style hosting
```

No server, no dependencies. Every contact action resolves to a `tel:`,
`wa.me`, or Gmail-compose URL — no backend needed.
