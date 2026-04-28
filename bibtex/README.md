# BibTeX Import

Paste BibTeX entries into `bibtex/inbox.bib`, then run:

```bash
python3 scripts/import_bibtex.py bibtex/inbox.bib
```

By default, arXiv entries go to `data/preprints.json`; other entries go to
`data/publications.json`.

To force a destination:

```bash
python3 scripts/import_bibtex.py bibtex/inbox.bib --target preprints
python3 scripts/import_bibtex.py bibtex/inbox.bib --target publications
```

Preview without writing:

```bash
python3 scripts/import_bibtex.py bibtex/inbox.bib --dry-run
```
