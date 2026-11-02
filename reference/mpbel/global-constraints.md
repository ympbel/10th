## Global Constraints

- Repository: `ympbel/ympbel.github.io`, public, default branch `main`, Pages source = GitHub Actions. `astro.config.mjs` has `site: 'https://ympbel.github.io'` and **no `base`** until cutover (then `site: 'https://mpbel.yonsei.ac.kr'` + `public/CNAME`). Do **not** add `public/CNAME` before cutover: it would redirect the preview URL to a domain that does not resolve yet.
- Korean only in phase 1. Every collection is read from `src/content/<collection>/ko/`; `src/content/<collection>/en/.gitkeep` exists; `src/pages/en/index.astro` is the only English page.
- One entry = one markdown file. Never a single aggregate file per collection.
- Files whose basename starts with `_` (templates) are excluded from every collection: `glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/<name>' })`.
- Same look: components reproduce the original element structure and class names (`topmenu`, `nav`, `sub_visual`, `snb`, `contentBox`, `cnt_title`, `loca`, `mb_peple`, `publication_oldver`, `tb_basic_s`, `bo_list`, `lat`, `lt_date`, etc.) so the copied CSS applies. The footer text is kept verbatim except the trailing `Design by DSSO` link and its separating spaces are removed. Fonts stay Google Fonts `Lato:300,400,700` and `Nanum Gothic`.
- No jQuery, bxslider or Font Awesome. The two Font Awesome icons that remain visible (bullhorn for pinned rows, home icon is an image already) are replaced by inline SVG or text.
- Crawler talks to `http://mpbel.yonsei.ac.kr` over plain HTTP, waits 0.5 s between network requests, sends `User-Agent: mpbel-migration-crawler/1.0`, and never runs after cutover. `legacy_url` keeps the full original URL; `legacy_images` / `legacy_files` keep **paths only** (no host).
- Internal links are absolute from site root and end with `/` (e.g. `/member/researchers/`). Astro default `build.format: 'directory'`.
- Dates in frontmatter are strings `YYYY-MM-DD`. Years are integers.
- Deferred (do not build): English content, gallery board content, news/seminar body images, comments, search, hit counts, old-URL redirects.

