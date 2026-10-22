# Christian Garry

Personal website for research, scientific computing and software engineering.

**Live site:** https://christiangarry.com/

The site presents selected projects, a public CV and links to professional profiles. It uses HTML, CSS and JavaScript and is hosted on GitHub Pages.

## Content

- **Home:** professional introduction, featured projects and contact details.
- **Projects:** selected research and engineering work, with card text and links curated in `data/pinned_projects.json`.
- **CV:** a reviewed public snapshot, with a downloadable PDF and individual entries.
- **Repository statistics:** an optional page at `stats.html`, using public GitHub repository data.

## Automatic public CV updates

The private CV repository remains the source of truth. Its build workflow automatically regenerates the PDF, HTML and entry index after source changes on main, then publishes the validated output to this website's public-cv/ directory. GitHub Pages deploys the website commit. New canonical entries marked cv: true appear automatically; no second entry list or manual copy is required.

Only generated public CV documents, entry prose and the two approved logos are exported. Raw Markdown, private notes, front matter attachments and supporting documents remain in the private repository. An export that fails validation leaves the previous public version available.

Publishing uses a dedicated write deploy key attached only to this website repository. Its private half belongs in the private CV repository's WEBSITE_DEPLOY_KEY Actions secret. No credential is sent to visitors or stored in this public repository. The workflow stages only public-cv/; the key itself has write access to the website repository.

The build and export code is committed. The deploy key still needs activation before automatic website publishing can run; the workflow reports a clear failure if the secret is absent. The current public CV remains available during setup.

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
