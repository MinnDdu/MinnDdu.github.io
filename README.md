# Min Soo Kim — Personal Website

Static, single-page academic site. No build step. Edit JSON → push → done.

> Live: `https://<your-username>.github.io/<repo-name>/`

---

## 🚀 Deploy to GitHub Pages

### One-time setup

1. **Create a GitHub repo** and push this folder:
   ```bash
   git init
   git add .
   git commit -m "initial site"
   git branch -M main
   git remote add origin https://github.com/MinnDdu/<repo-name>.git
   git push -u origin main
   ```

   > **Tip:** if you name the repo exactly `MinnDdu.github.io`, your site lives at the root domain `https://minnddu.github.io` (no subpath).

2. **Enable GitHub Pages**
   - Repo → **Settings** → **Pages**
   - **Source**: `GitHub Actions`
   - The workflow at `.github/workflows/deploy.yml` does the rest.

3. **Wait ~1 min**, then check the **Actions** tab. Once green, your site is live.

### Day-to-day

Just edit and push:
```bash
git add .
git commit -m "add new paper"
git push
```

The workflow re-deploys automatically on every push to `main`.

### Custom domain (optional)

1. Buy a domain (e.g., `minsoo.dev`).
2. At your registrar, add a `CNAME` DNS record pointing to `MinnDdu.github.io`.
3. In **Settings → Pages**, set **Custom domain** to `minsoo.dev` and enable HTTPS.

---

## ✏️ Editing content

**All content lives in `data/*.json`. You don't need to touch code.**

| File | What it is |
|---|---|
| `data/profile.json` | Name, bio, email, links, "currently" list |
| `data/news.json` | Recent activity feed |
| `data/publications.json` | Published papers |
| `data/preprints.json` | arXiv / under-review papers |
| `data/experience.json` | Internships, research positions |
| `data/education.json` | Degrees |
| `data/awards.json` | Awards, scholarships |
| `data/misc.json` | Hobbies, interests |
| `data/fortunes.json` | Quotes for the rotating "fortune" box |

### Markdown in text fields

Most text fields support inline markdown:

| Syntax | Renders as |
|---|---|
| `` `monospace` `` | inline code style |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `[label](https://url)` | hyperlink |

Example (`data/news.json`):
```json
{
  "date": "2025-03",
  "text": "Paper accepted at **NeurIPS 2025** — see [project page](https://example.com).",
  "tag": "paper"
}
```

### Adding a publication

Edit `data/publications.json`:
```json
{
  "items": [
    {
      "title": "Your Paper Title",
      "authors": "Min Soo Kim, Co-author, Senior Author",
      "venue": "NeurIPS",
      "year": 2025,
      "links": {
        "pdf": "https://arxiv.org/pdf/xxxx.pdf",
        "code": "https://github.com/MinnDdu/repo",
        "site": "https://project-page.com"
      },
      "tldr": "One-line summary (optional)."
    }
  ]
}
```
- Your name (`Min Soo Kim`) is auto-bolded in the author list.
- All `links` keys are optional — omit any that don't apply.

### Adding an award / experience / education entry

Same pattern: open the JSON, copy an existing item, edit values. Empty arrays auto-hide their section.

### CV (PDF)

1. Save your CV as `cv.pdf` at the **project root** (next to `index.html`).
2. The "↓ CV (pdf)" button in the Contact section already points to it.
3. To put it elsewhere, update `data/profile.json` → `"links": { "cv": "assets/cv.pdf" }`.

### Profile photo

Replace `assets/profile.svg` with your photo (JPG/PNG, square, 600×600+).
If you change the filename, update the `<img>` `src` in `app.js` (search for `profile.svg`).

### Paper thumbnails (optional)

Save as `assets/pub-1.jpg` etc., then add `"thumb": "assets/pub-1.jpg"` to a publication entry.

---

## 🛠 Run locally

No build step. Just serve the folder:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Open `http://localhost:8000`.

> Don't open `index.html` directly with `file://` — the JSON fetches will fail due to CORS.

---

## 🧱 Project structure

```
.
├── index.html              # entry point
├── app.js                  # React app (loaded via Babel-standalone)
├── tweaks-panel.js         # in-design tweak controls
├── styles.css              # all styles + light/dark theme
├── data/                   # ← edit these
│   ├── profile.json
│   ├── news.json
│   ├── publications.json
│   ├── preprints.json
│   ├── experience.json
│   ├── education.json
│   ├── awards.json
│   ├── misc.json
│   └── fortunes.json
├── assets/                 # images, PDFs
│   ├── profile.svg
│   ├── pub-*.svg
│   └── cv.pdf              ← add yours
├── .github/workflows/
│   └── deploy.yml          # auto-deploy to Pages
└── .nojekyll               # tells GH Pages: don't run Jekyll
```

---

## ⌨️ Keyboard shortcuts

- `t` — toggle theme (light/dark)
- `g p` — go to publications
- `g n` — go to news
- `g c` — go to contact
- `g e` — go to experience
- `g a` — go to awards
- `?` — show all shortcuts

---

## 📝 Notes

- The site uses `<script type="text/babel">` to transpile JSX in the browser — fine for a personal site, but page load is slightly heavier than a built bundle. If you ever need a real build, set up Vite/esbuild and update `index.html`'s script tags.
- Theme preference is saved to `localStorage` and respects `prefers-color-scheme` on first visit.
- The `.nojekyll` file disables Jekyll on GitHub Pages so files starting with `_` and folders like `.github/` aren't munged.

---

## License

Personal content © Min Soo Kim. Code: do whatever (MIT).
