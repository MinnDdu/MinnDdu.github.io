# Data JSON Templates

Use this as the copy/paste guide for files in `data/`. Keep every `.json` file valid JSON: double quotes only, commas between items, and no trailing comma after the last item.

Quick check after editing:

```bash
python3 -m json.tool data/profile.json
python3 -m json.tool data/publications.json
```

For paper entries, `thumbnail` must point to an image file such as `.png`, `.jpg`, `.webp`, or `.svg`. Do not use PDF as a thumbnail. Put PDF or paper URLs under `links.paper`.

## `profile.json`

One object for the homepage hero and contact section.

```json
{
  "name": "Min Soo Kim",
  "handle": "minsoo",
  "affiliation": "Yonsei University · AI",
  "role": "Graduate Student",
  "interests": ["NLP", "Multimodal", "AI Safety"],
  "location": "Seoul, South Korea",
  "email": "markkim1@yonsei.ac.kr",
  "tagline": "Short one-line description.",
  "bio": "Longer intro. Supports `code`, **bold**, *italic*, and [links](https://example.com).",
  "currently": [
    "Current project or status",
    "Another current activity"
  ],
  "links": {
    "email": "mailto:markkim1@yonsei.ac.kr",
    "github": "https://github.com/MinnDdu",
    "scholar": "https://scholar.google.com/citations?user=...",
    "x": "https://x.com/...",
    "cv": "assets/cv.pdf"
  },
  "image": "assets/profile.png",
  "imageLabel": "~/photo.png"
}
```

Notes:
- `image` controls the hero profile photo.
- `imageLabel` controls the small terminal-style label over the photo.
- `links.cv` can point to `cv.pdf` or `assets/cv.pdf`.

## `publications.json`

Array of published or accepted papers.

```json
[
  {
    "title": "Paper Title",
    "authors": [
      "First Author",
      "Min Soo Kim",
      "Senior Author"
    ],
    "me": "Min Soo Kim",
    "venue": "ACL",
    "year": 2026,
    "venueColor": "ghost",
    "tags": ["Oral", "Best Paper"],
    "equalContribution": false,
    "thumbnail": "assets/paper-thumbnail.png",
    "links": {
      "paper": "https://example.com/paper.pdf",
      "code": "https://github.com/user/repo",
      "project": "https://project-page.com",
      "bibtex": "assets/paper.bib"
    },
    "abstract": "Optional abstract shown when the abstract toggle is clicked."
  }
]
```

Notes:
- Add `*`, `†`, or `‡` directly in an author name if needed, e.g. `"Min Soo Kim*"`.
- `me` is used to bold your name in the author list.
- `links` keys are optional. Omit missing links.
- Use `tags: []` if there are no tags.
- `equalContribution` is optional; omit it unless needed.

## `preprints.json`

Array of arXiv, under-review, or unpublished papers. Same shape as `publications.json`.

```json
[
  {
    "title": "Preprint Title",
    "authors": [
      "First Author",
      "Min Soo Kim"
    ],
    "me": "Min Soo Kim",
    "venue": "arXiv",
    "year": 2026,
    "venueColor": "ghost",
    "tags": ["Under review"],
    "thumbnail": "assets/preprint-thumbnail.png",
    "links": {
      "paper": "https://arxiv.org/abs/0000.00000"
    },
    "abstract": ""
  }
]
```

BibTeX shortcut:

```bash
python3 scripts/import_bibtex.py bibtex/inbox.bib
```

## `news.json`

Array of dated updates.

```json
[
  {
    "date": "2026-04",
    "text": "Paper accepted to **ACL 2026**."
  },
  {
    "date": "2026-02-15",
    "text": "Started a new project on [multimodal safety](https://example.com)."
  }
]
```

Notes:
- `text` supports inline markdown: `code`, **bold**, *italic*, and `[link](https://...)`.
- Date can be `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`.

## `education.json`

Array of education entries.

```json
[
  {
    "degree": "B.S. in Computer Science",
    "school": "Stony Brook University",
    "lab": "Optional Lab Name",
    "advisor": "Prof. Name",
    "gpa": "3.80 / 4.00",
    "honors": "Magna Cum Laude",
    "start": "2020",
    "end": "2024",
    "location": "Stony Brook, NY, USA"
  }
]
```

Notes:
- Optional fields: `lab`, `advisor`, `gpa`, `honors`, `location`.
- `start` and `end` are displayed as `start — end`.

## `experience.json`

Array of research, internship, or work entries.

```json
[
  {
    "role": "Research Intern",
    "org": "Organization Name",
    "team": "Team or Advisor",
    "start": "Jun 2025",
    "end": "Aug 2025",
    "summary": "One-sentence description of what you did."
  }
]
```

Notes:
- `team` is optional.
- `summary` is displayed as the note under the role and organization.

## `awards.json`

Array of awards, honors, and scholarships.

```json
[
  {
    "title": "Academic Achievement, Fall 2022 Semester",
    "issuer": "Stony Brook University",
    "year": "2022",
    "note": "$2000 Merit-based Scholarship"
  }
]
```

Notes:
- `note` is optional.
- `year` can also be a range like `2024 — 2026`.

## `misc.json`

Array of short label/value rows.

```json
[
  {
    "label": "music",
    "value": "Wave to Earth on repeat."
  },
  {
    "label": "hobbies",
    "value": "Bouldering, film photography."
  }
]
```

## `fortunes.json`

Array of quotes shown in the rotating quote box.

```json
[
  {
    "quote": "All models are wrong, but some are useful.",
    "by": "George E. P. Box"
  }
]
```

## Common Patterns

Empty section:

```json
[]
```

Local asset path:

```json
"assets/file-name.png"
```

External link:

```json
"https://example.com"
```

Mail link:

```json
"mailto:name@example.com"
```
