# Adam Tailors — paused client preview

The owner approved publishing this paused preview on 15 November 2026.

The static holding page displays the payment notice and emails iddyibby@gmail.com.
`index.html` and `404.html` are identical, self-contained pages. They contain no original website HTML, JavaScript, iframe, or external requests. The background currently uses the original sharing photograph, blurred with CSS, pending a real homepage screenshot (Chrome screenshot access was denied).

## Preview

Run `python3 -m http.server 8001 --bind 127.0.0.1` here and visit http://127.0.0.1:8001/ . Also open a nonexistent path to check the holding page on GitHub Pages; Python's basic server does not emulate the custom GitHub Pages 404. Open `/404.html` locally to review that version.

## Backup and restore after payment

The complete original website is preserved locally in `.local-backup/website-before-payment-pause.tar.gz`, with an extracted copy in `.local-backup/original/`. Removed working files are additionally preserved in `.local-backup/removed-working-files/`. `.local-backup/` is gitignored: never force-add it, upload it, or include it in a deployment archive.

To restore, from this repository directory:

```sh
python3 - <<'RESTORE'
from pathlib import Path
import tarfile
archive = Path('.local-backup/website-before-payment-pause.tar.gz')
with tarfile.open(archive) as saved:
    for entry in saved:
        p = Path(entry.name)
        if p.is_absolute() or '..' in p.parts or entry.issym() or entry.islnk():
            raise ValueError('Unsafe archive path')
    saved.extractall('.')
Path('404.html').unlink(missing_ok=True)
RESTORE
python3 scripts/check.py
node --check script.js
node --check translations.js
node scripts/check-languages.js
```

Review the restored website locally, then commit and push the restored files when ready. The archive restores the original README and .gitignore too; keep `.local-backup/` in .gitignore before staging changes.

## Publishing after review

Existing host: https://ims200.github.io/Adam-Tailors/ — Pages builds `main` from `/`.

For future updates, obtain owner approval. Commit the holding-page additions **and original-file removals** together, then push. The only public website files should be `index.html`, `404.html`, and `.nojekyll`. Do not upload the whole local folder. Review `git status --short` and `git diff --cached --name-status` before pushing; verify `.local-backup/` is ignored with `git check-ignore .local-backup/website-before-payment-pause.tar.gz`.

The custom `404.html` serves the holding screen for missing paths without redirecting, so nested direct links work without relative assets. Original public pages and assets have been removed from this deployment tree. GitHub Pages is static hosting: this is a paused presentation, not password authentication, and cannot revoke previously downloaded/cached copies or public Git history. A public source repository may still contain the original files in earlier commits.
