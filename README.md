# Christian Garry

Personal website for research, scientific computing and software engineering.

**Live site:** https://christiangarry.com/

The site presents selected projects, a public CV and links to professional profiles. It uses HTML, CSS and JavaScript and is hosted on GitHub Pages.

## Content

- **Home:** professional introduction, featured projects and contact details.
- **Projects:** selected research and engineering work, with card text and links curated in `data/pinned_projects.json`.
- **CV:** a reviewed public snapshot, with a downloadable PDF and individual entries.
- **Repository statistics:** an optional page at `stats.html`, using public GitHub repository data.

## Public CV snapshot

`public-cv/` contains the material intentionally published on this website: `cv.html`, `cv.pdf`, `entries.json` and individually selected files in `assets/`. The source CV repository is private; the website reads the local public snapshot and does not request private repository contents in a visitor's browser.

When updating the CV:

1. Generate the CV in the private source repository.
2. Review the HTML, PDF and selected entries for publication, and update the explicit manifest in `public_export.json`.
3. Use `export_public.py` in the private CV repository to export only the approved material into this website's `public-cv/` directory.
4. Check the CV, entry pages, download and links locally before publishing.

Attachments are selected individually. Do not automatically copy the source repository's assets, transcripts, reports or other attachments into the public snapshot. An entry should only link to an attachment that has been explicitly included for publication.

No browser token is needed. Keep GitHub access tokens and other credentials out of client-side code, data files and the public repository.

The private CV build workflow includes a prepared publishing step, but automatic publication requires a dedicated deploy credential scoped to this website repository. That credential has not been configured; updating the private CV alone does not currently publish a new snapshot here.

## Project cards

Edit `data/pinned_projects.json` to select and order featured projects. Each record contains the displayed `title`, `category`, `subtitle`, `description`, `tags` and `links`. Every link has a `label` and an HTTPS `url`; the first link is also the title's destination.

```json
{
  "title": "Well-posedness of MV-FBSDEs with jumps",
  "category": "Stochastic analysis",
  "subtitle": "Research with Chunrong Feng · arXiv preprint",
  "description": "Existence, uniqueness and stability for fully coupled McKean–Vlasov forward–backward SDEs with jumps.",
  "tags": ["Stochastic analysis", "Well-posedness"],
  "links": [
    {"label": "Read paper", "url": "https://arxiv.org/abs/2608.23203"}
  ]
}
```

The homepage renders these local records directly. Project cards do not fetch remote READMEs or cover Markdown. Keep descriptions concise and factual, label destinations clearly, and distinguish a preprint from a published journal article. Repository links should point to intentionally public work.

## Structure

```text
.
├── index.html
├── cv.html
├── entry.html
├── stats.html
├── 404.html
├── public-cv/
├── data/
│   └── pinned_projects.json
├── scripts/
├── styles/
└── assets/
```

## Local preview

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ and check the homepage, project links, CV, CV entries and mobile navigation. Public GitHub data requires an internet connection; published CV content is served from this repository.

## Deployment

GitHub Pages serves the repository root from the configured publishing branch. Keep `CNAME` set to `christiangarry.com`. Review the public files before pushing changes to that branch.

## License

MIT
