# assets/

Static files: images, PDFs, anything you want to link from the site.

## Profile photo
Replace `profile.svg` with your photo:
- Recommended: square crop, **at least 600×600px**, JPG or PNG.
- Save as `assets/profile.jpg` (or `.png`), then update `app.js`:
  ```jsx
  // search for "profile.svg" and replace with your filename
  ```

## Paper thumbnails
Each publication can have a thumbnail image. Save as:
- `assets/pub-1.svg` (or .jpg / .png)
- `assets/pub-2.svg`, etc.

Then in `data/publications.json` add a `thumb` field:
```json
{
  "title": "...",
  "thumb": "assets/pub-1.jpg"
}
```

## CV
- Place your CV at `assets/cv.pdf` (or project root as `cv.pdf`).
- Update `data/profile.json` → `links.cv` to match the path.
- See `cv.pdf.placeholder` for instructions.

## Image guidelines
- **SVG**: best for diagrams / placeholders (small, scales).
- **JPG**: photos and screenshots (compress to <200KB ideally).
- **PNG**: only when you need transparency.
- Use [squoosh.app](https://squoosh.app) to compress before committing.
