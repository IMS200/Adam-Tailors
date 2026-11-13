# Adam Tailors preview

A buildless, responsive single-page website. No packages, build process, database or account system. All public business details come from the supplied brief. This directory contains only the website, its assets and supporting documentation/scripts.

## Preview and check

From this directory:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000 . Stop with Ctrl-C.

```sh
python3 scripts/check.py
node --check script.js
```

## Edit

- Text, business details, bilingual names, call links and structured data: `index.html`. Search for the current detail and update every occurrence, including metadata and JSON-LD. The Arabic name uses `lang="ar" dir="rtl"`.
- Colours, fonts, spacing and responsive layout: `style.css` (variables at the top).
- Mobile navigation and copyright year: `script.js`.
- Photography: replace `assets/tailoring.jpg`; update its alt text, photo disclosure and `ASSETS.md`. Replace `assets/social.jpg` with a 1200 × 630 sharing image. Asset licences and sources are in `ASSETS.md`.
- The displayed year updates automatically, with 2026 as the no-JavaScript fallback.

## Publish to GitHub Pages

Repository: https://github.com/IMS200/Adam-Tailors

GitHub Pages: https://ims200.github.io/Adam-Tailors/

Pages publishes the `main` branch from the repository root. For future edits, run the checks, commit the changed website files and push to `main`. Canonical and sharing URLs are configured for this preview address.

The instructions below describe creating a separate repository; skip repository creation for this existing project.

1. Install the official GitHub CLI from https://cli.github.com/ and sign in with `gh auth login`.
2. Run the following from this directory. This creates a **new public** repository. If that name already exists, inspect it first; do not push into an unrelated repository.

```sh
git init -b main
git add index.html style.css script.js assets scripts README.md ASSETS.md .gitignore .nojekyll
git diff --cached --stat
git commit -m "Build Adam Tailors website preview"
gh repo create adam-tailors-preview --public --source=. --remote=origin --push
```

3. On the new repository, open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main** and **/ (root)**, and save. GitHub Pages is free for this public repository.
4. Once GitHub displays its Pages address, set the canonical and absolute sharing URLs (replace USERNAME with your account):

```sh
python3 scripts/set-url.py https://USERNAME.github.io/adam-tailors-preview/
python3 scripts/check.py
git add index.html
git commit -m "Set published website metadata"
git push
```

5. Wait for the Pages deployment to succeed in GitHub Actions, then open the live URL. Check assets, navigation and social metadata before sharing. Relative local asset paths support the `/adam-tailors-preview/` path.

No canonical or `og:url` is guessed before publication. The sharing image is included locally; social crawlers need the absolute URL set by step 4.

## Before official use

Ask the owner to confirm the business names (including Arabic), telephone, full address, service wording, traditional-item names and current availability. Confirm opening hours directly; no hours, prices, timelines, specialist services or testimonials have been invented. Obtain shop/product photography if desired and replace the illustrative stock photograph. The owner should approve the preview’s design and information before treating it as their official website.

## Verification

Source checks cover anchor targets, image paths and descriptions, phone links, the full directions address, one H1, Arabic direction and valid factual JSON-LD. JavaScript syntax is checked separately. Browser layout inspection was blocked because Computer Use access to Google Chrome was not approved; desktop/mobile visual behavior needs browser confirmation before official launch.
