# Christian Garry – Living CV

A **living, self-updating CV** and research notebook, powered by my real GitHub, LinkedIn, and CV repositories.

This site is meant to feel like a cross between a personal research homepage and a status dashboard: featured projects look like little research papers, activity streams in from my developer and professional networks, and the latest CV entry is always one click away.

---

## 🌐 Live Site

> **Live:** https://christiangarry.com/

---

## ✨ Features

### Hero & Networks
- Clean hero card with name, roles, and tagline  
- GitHub + LinkedIn count chips  
- GitHub contribution “Green Wall” banner  

### Featured Projects
Configured via `data/pinned_projects.json`:  
- Horizontal strip of “paper cards”  
- Ivory textured background  
- README rendered inside the card  
- Lightweight markdown renderer  
- Designed to look like academic abstracts  

### Latest GitHub Projects  
- Fetches all repos  
- Filters out forks  
- Sorted by latest update  
- Scrollable card with language, stars, updated timestamp  

### Latest LinkedIn Post  
- Full-embed LinkedIn post
- Height-fixed card that fills with content  
- Configured via `data/linkedin.json`  

### Latest CV Entry  
- Pulled from separate repo: **CV/entries/**  
- Supports YAML front-matter: title, date, cover image, links  
- Uses jsDelivr CDN for raw Markdown  
- Generates snippet + cover preview  
- Links into `entry.html` for full-page view  

---

## Tech Stack

- HTML5  
- Custom CSS
- Vanilla JavaScript  
- GitHub API

---

## Structure

```
.
├── index.html
├── cv.html
├── entry.html
├── scripts/
│   ├── index.js
│   ├── cv.js
│   └── entry.js
├── styles/
│   ├── index.css
│   └── cv.css
├── assets/
└── data/
    ├── linkedin.json
    └── pinned_projects.json
```

---

## Configuration

### LinkedIn (`data/linkedin.json`)
```
{
  "handle": "your-handle",
  "profile": "https://www.linkedin.com/in/your-handle/",
  "connections": 500,
  "latestPost": "https://www.linkedin.com/feed/update/urn:li:activity:1234..."
}
```

### Pinned Projects (`data/pinned_projects.json`)
```
[
  {
    "owner": "cgarryZA",
    "repo": "ReyrolleGPT-2",
    "title": "ReyrolleGPT-2: Engineering Knowledge RAG",
    "branch": "main",
    "readme": "README.md"
  }
]
```

---

## Running Locally
```
python3 -m http.server 8000
```
Visit: http://localhost:8000/

---

## Deployment
1. Push repo to GitHub  
2. Settings → Pages  
3. “Deploy from branch”, choose `main`  
4. Set root directory  

---

## License
MIT
