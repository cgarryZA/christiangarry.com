import { loadPublicCv, entryHref, safeCoverUrl } from "./cv-data.js";

const GITHUB_USERNAME = "cgarryZA";
const EXCLUDED_REPOS = new Set(["cv", "cgarryza", "christiangarry.com", "keyboard"]);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function publicLink(label, href, className) {
  const url = new URL(href);
  if (url.protocol !== "https:") throw new Error("Expected a public HTTPS link");
  const link = element("a", className, label);
  link.href = url.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

async function loadFeaturedProjects() {
  const response = await fetch("data/pinned_projects.json");
  if (!response.ok) throw new Error("Project details unavailable");
  const projects = await response.json();
  const cards = projects.map((project) => {
    const card = element("article", "featured-card");
    card.setAttribute("role", "listitem");
    const inner = element("div", "featured-inner");
    inner.append(element("p", "featured-meta", project.category));
    const title = element("h3", "featured-title");
    title.append(publicLink(project.title, project.links[0].url));
    inner.append(title, element("p", "featured-subtitle", project.subtitle));
    inner.append(element("p", "featured-body", project.description));
    const tags = element("ul", "project-tags");
    project.tags.forEach((tag) => tags.append(element("li", "", tag)));
    inner.append(tags);
    const actions = element("div", "project-actions");
    project.links.forEach((link) => actions.append(publicLink(link.label + " ↗", link.url, "text-link")));
    inner.append(actions);
    card.append(inner);
    return card;
  });
  document.getElementById("featured-projects").replaceChildren(...cards);
}

async function loadRecentCode() {
  const response = await fetch("https://api.github.com/users/" + GITHUB_USERNAME + "/repos?per_page=100&sort=pushed");
  if (!response.ok) throw new Error("GitHub repositories unavailable");
  const repos = (await response.json())
    .filter((repo) => !repo.fork && !repo.archived && !repo.private && repo.description && !EXCLUDED_REPOS.has(repo.name.toLowerCase()))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 3);
  if (!repos.length) return;
  const cards = repos.map((repo) => {
    const card = element("div", "repo-item");
    card.setAttribute("role", "listitem");
    const link = publicLink("", repo.html_url, "latest-card");
    link.append(element("h3", "repo-name", repo.name));
    link.append(element("p", "desc", repo.description));
    const details = element("p", "badges");
    if (repo.language) details.append(element("span", "", repo.language));
    const date = new Date(repo.pushed_at);
    if (!Number.isNaN(date.valueOf())) {
      const time = element("time", "", "Updated " + date.toLocaleDateString("en-GB", { month: "short", year: "numeric" }));
      time.dateTime = date.toISOString();
      details.append(time);
    }
    link.append(details);
    card.append(link);
    return card;
  });
  document.getElementById("repo-list").replaceChildren(...cards);
}

async function loadCurrentWork() {
  const cv = await loadPublicCv();
  const entry = cv.entries.find((item) => item.id === cv.highlight);
  if (!entry) return;
  document.getElementById("cv-latest-link").href = entryHref(entry);
  document.getElementById("cv-title").textContent = entry.title;
  document.getElementById("cv-date").textContent = entry.period || entry.date || "";
  document.getElementById("cv-snippet").textContent = entry.summary;
  const cover = safeCoverUrl(entry.cover);
  if (cover) {
    const image = document.getElementById("cv-cover");
    image.src = cover;
    image.hidden = false;
  }
}

document.getElementById("year").textContent = String(new Date().getFullYear());
// Each section has useful static links if a network request is unavailable.
await Promise.allSettled([loadFeaturedProjects(), loadRecentCode(), loadCurrentWork()]);
