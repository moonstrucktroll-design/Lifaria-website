# Lifaria Website

Static website for `lifaria.com`, built from the local Lifaria iOS prototype branding and mockup screens.

The site is plain HTML, CSS, and JavaScript, so Vercel can deploy it directly from the repository root with no build command.

## Local preview

Open `index.html` directly in a browser, or run a tiny local server from the repository root:

```sh
python3 -m http.server 8877
```

Then visit `http://127.0.0.1:8877`.

## Vercel settings

- Framework preset: Other
- Build command: leave empty
- Output directory: `.`
