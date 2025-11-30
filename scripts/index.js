// ===== CONFIG =====
const GITHUB_USERNAME = "cgarryZA";
const LI_JSON_URL = "data/linkedin.json";
const PINNED_JSON_URL = "data/pinned_projects.json";

// CV repo config
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_BRANCH = "main";

const CV_LOCAL_CACHE_KEY = "cv_index_cache_v1";
const CV_LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ---- helpers
const $ = (s) => document.querySelector(s);

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
  );
}

const nf = new Intl.NumberFormat();

/* Minimal markdown -> HTML for featured cards */
function mdToHtmlFeatured(mdRaw) {
  let md = String(mdRaw || "");

  // strip fenced code blocks (keep it clean / paper-like)
  md = md.replace(/```[\s\S]*?```/g, "");

  // images
  md = md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) =>
      `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`
  );

  // links
  md = md.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) =>
      `<a href="${escapeHtml(
        href
      )}" target="_blank" rel="noreferrer noopener">${escapeHtml(text)}</a>`
  );

  // bold / italic
  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // headings
  md = md.replace(/^\s*###\s+(.+)$/gm, "<h3>$1</h3>");
  md = md.replace(/^\s*##\s+(.+)$/gm, "<h2>$1</h2>");
  md = md.replace(/^\s*#\s+(.+)$/gm, "<h1>$1</h1>");

  // bullet lists
  md = md.replace(
    /(^|\n)(- [^\n]+(?:\n- [^\n]+)*)/g,
    (full, lead, block) => {
      const items = block
        .split("\n")
        .map((l) => l.replace(/^- /, "").trim())
        .filter(Boolean);
      const lis = items.map((txt) => `<li>${txt}</li>`).join("");
      return `${lead}<ul>${lis}</ul>`;
    }
  );

  // paragraphs
  const parts = md
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) =>
      /^<(h\d|ul|img|iframe)/i.test(block)
        ? block
        : `<p>${block}</p>`
    );

  return parts.join("\n");
}

// =====================
// GitHub block
// =====================
async function loadGithub() {
  const r = await fetch(
    `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}`
  );
  if (!r.ok) throw new Error(`GH profile ${r.status}`);
  const u = await r.json();

  const ghUrl = u.html_url || `https://github.com/${GITHUB_USERNAME}`;

  // Networks card chips
  const netGhLink = $("#net-gh-link");
  if (netGhLink) netGhLink.href = ghUrl;

  setTextById("net-gh-user", "@" + (u.login || GITHUB_USERNAME));
  setTextById("net-gh-followers", `${nf.format(u.followers ?? 0)} followers`);
  setTextById("net-gh-repos", `${nf.format(u.public_repos ?? 0)} repos`);

  // Green-Wall banner (if present)
  const gw = $("#gw");
  if (gw) {
    const qs = new URLSearchParams({ theme: "Classic" });
    gw.src = `https://green-wall.leoku.dev/api/og/share/${encodeURIComponent(
      GITHUB_USERNAME
    )}?${qs}`;
  }
}

// =====================
// Featured projects (pinned_projects.json + repo READMEs)
// =====================
async function loadPinnedProjects() {
  const container = document.getElementById("featured-projects");
  if (!container) return;

  let resp;
  try {
    resp = await fetch(PINNED_JSON_URL, { cache: "no-store" });
  } catch (e) {
    console.warn("[Featured] pinned_projects.json fetch failed", e);
    return;
  }
  if (!resp.ok) {
    console.warn("[Featured] pinned_projects.json not found");
    return;
  }

  let pins;
  try {
    pins = await resp.json();
  } catch (e) {
    console.warn("[Featured] Invalid JSON in pinned_projects.json", e);
    return;
  }

  if (!Array.isArray(pins) || !pins.length) return;

  container.innerHTML = "";

  for (const pin of pins) {
    const owner = pin.owner || GITHUB_USERNAME;
    const repo = pin.repo;
    if (!repo) continue;

    const branch = pin.branch || "main";
    const readmePath = pin.readme || "README.md";
    const title = pin.title || repo;
    const githubUrl =
      pin.githubUrl ||
      `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}`;

    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${readmePath}`;

    let readmeText = "";
    try {
      const r = await fetch(rawUrl);
      if (r.ok) {
        readmeText = await r.text();
      } else {
        console.warn("[Featured] README fetch failed for", repo, r.status);
      }
    } catch (e) {
      console.warn("[Featured] README fetch error for", repo, e);
    }

    const card = document.createElement("article");
    card.className = "card featured-card";

    const inner = document.createElement("div");
    inner.className = "featured-inner";

    const h3 = document.createElement("h3");
    h3.className = "featured-title";
    h3.textContent = title;

    const meta = document.createElement("p");
    meta.className = "featured-meta";
    meta.innerHTML = `<a href="${githubUrl}" target="_blank" rel="noreferrer noopener">View on GitHub</a>`;

    const body = document.createElement("div");
    body.className = "featured-body";
    body.innerHTML = readmeText
      ? mdToHtmlFeatured(readmeText)
      : "<p><em>README not available.</em></p>";

    inner.appendChild(h3);
    inner.appendChild(meta);
    inner.appendChild(body);
    card.appendChild(inner);
    container.appendChild(card);
  }
}

// =====================
// Latest repos card (scrollable list)
// =====================
async function loadLatestRepo() {
  const r = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      GITHUB_USERNAME
    )}/repos?per_page=100&sort=updated`
  );
  if (!r.ok) return;

  const repos = (await r.json())
    .filter((x) => !x.fork)
    .sort(
      (a, b) =>
        new Date(b.pushed_at || b.updated_at) -
        new Date(a.pushed_at || a.updated_at)
    );

  const listEl = document.getElementById("repo-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  for (const repo of repos) {
    const link = document.createElement("a");
    link.className = "repo latest-card";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";

    const content = document.createElement("div");
    content.className = "latest-content";

    const textWrap = document.createElement("div");

    const nameEl = document.createElement("h3");
    nameEl.className = "repo-name";
    nameEl.textContent = repo.name || "Repo";

    const descEl = document.createElement("p");
    descEl.className = "desc muted";
    descEl.innerHTML = repo.description
      ? escapeHtml(repo.description)
      : "No description";

    const badges = document.createElement("div");
    badges.className = "badges";

    const lang = document.createElement("span");
    lang.textContent = repo.language ? `💻 ${repo.language}` : "";

    const stars = document.createElement("span");
    stars.textContent = repo.stargazers_count
      ? `⭐ ${nf.format(repo.stargazers_count)}`
      : "";

    const updated = document.createElement("span");
    updated.textContent = repo.pushed_at
      ? `🕒 Updated ${new Date(repo.pushed_at).toLocaleDateString()}`
      : "";

    if (lang.textContent) badges.appendChild(lang);
    if (stars.textContent) badges.appendChild(stars);
    if (updated.textContent) badges.appendChild(updated);

    textWrap.appendChild(nameEl);
    textWrap.appendChild(descEl);
    textWrap.appendChild(badges);

    // Chevron icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "chev");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path.setAttribute("d", "M8.5 4.5l7 7-7 7");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);

    content.appendChild(textWrap);
    content.appendChild(svg);

    link.appendChild(content);
    listEl.appendChild(link);
  }
}

// =====================
// LinkedIn from local JSON
// =====================
function extractActivityId(url) {
  if (!url) return null;
  const m1 = url.match(/urn:li:activity:(\d+)/i);
  if (m1) return m1[1];
  const m2 = url.match(/activity[-:](\d+)/i);
  return m2 ? m2[1] : null;
}

async function loadLinkedIn() {
  const r = await fetch(LI_JSON_URL, { cache: "no-store" });
  if (!r.ok) {
    console.warn("[LI] data/linkedin.json not found");
    return;
  }
  const j = await r.json();

  // Build profile URL
  const profileUrl = j.handle
    ? `https://www.linkedin.com/in/${j.handle}/`
    : j.profile || "#";

  // Networks chip
  const liChip = $("#net-li-link");
  if (liChip) {
    liChip.href = profileUrl;
    liChip.target = "_blank";
    liChip.rel = "noreferrer noopener";
  }

  if (j.handle) setTextById("net-li-user", `/in/${j.handle}`);
  if (Number.isFinite(j.connections))
    setTextById(
      "net-li-connections",
      `${nf.format(j.connections)} connections`
    );

  // Latest post embed
  const postUrl = j.latestPost;
  const fb = document.getElementById("li-fallback");
  if (fb) fb.href = postUrl || profileUrl;

  const actId = extractActivityId(postUrl);
  if (!actId) return;

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${actId}`;
  iframe.width = "100%";
  iframe.height = "1000";
  iframe.style.border = "0";
  iframe.style.borderRadius = "10px";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";

  const container = document.getElementById("li-embed");
  if (container) {
    container.innerHTML = "";
    container.appendChild(iframe);
  }
}

// =====================
// CV: latest entry card
// =====================
function jsDelivrRaw(owner, repo, path, ref = "main") {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
}

function parseFrontMatter(md) {
  if (!md.startsWith("---")) return { meta: {}, body: md };
  const end = md.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: md };
  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 4).replace(/^\s*\n/, "");
  const meta = {};
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (m) {
      const k = m[1].trim();
      let v = m[2].trim();
      v = v.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      meta[k] = v;
    }
  });
  return { meta, body };
}

function makeSnippet(md) {
  let s = String(md || "");
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/!\[[^\]]*]\([^)]+\)/g, "");
  s = s.replace(/\[[^\]]*]\([^)]+\)/g, (m) =>
    m.replace(/\[|\]|\([^)]*\)/g, "")
  );
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/[*_`>]/g, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 500) s = s.slice(0, 500).trim() + "…";
  return s || "—";
}

function extractFirstImage(md, coverFromMeta) {
  if (coverFromMeta) return coverFromMeta;
  const m = md.match(/!\[[^\]]*]\(([^)]+)\)/);
  return m ? m[1] : null;
}

function normSlashes(p) {
  return String(p || "").replace(/\\/g, "/");
}
function dirnameFromRaw(rawUrl) {
  return rawUrl.replace(/\/[^/]*$/, "/");
}
function repoRootFromRaw(rawUrl) {
  const m = rawUrl.match(
    /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+\/[^@]+@[^/]+)\//i
  );
  return m ? m[1] + "/" : dirnameFromRaw(rawUrl);
}
function resolveCoverURL(rawMdUrl, cover) {
  if (!cover) return null;
  let c = normSlashes(cover).replace(/^\.\//, "");
  if (/^https?:\/\//i.test(c)) return c;

  const baseDir = dirnameFromRaw(rawMdUrl);
  const root = repoRootFromRaw(rawMdUrl);
  if (c.startsWith("assets/")) return root + c;
  return baseDir + c;
}

function loadLocalCvCache() {
  try {
    const raw = localStorage.getItem(CV_LOCAL_CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj.updatedAt) return null;
    if (Date.now() - obj.updatedAt > CV_LOCAL_CACHE_TTL_MS) return null;
    return obj;
  } catch {
    return null;
  }
}
function saveLocalCvCache(obj) {
  try {
    localStorage.setItem(CV_LOCAL_CACHE_KEY, JSON.stringify(obj));
  } catch {
  }
}

async function fetchCvEntriesFromApi() {
  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  if (!r.ok) throw new Error(`CV list ${r.status}`);
  const files = await r.json();
  const mdFiles = files.filter((f) => /\.md$/i.test(f.name));

  // sort by filename date prefix if present (YYYY-MM-DD-title.md)
  mdFiles.sort((a, b) => {
    const da = a.name.match(/^(\d{4}-\d{2}-\d{2})/);
    const db = b.name.match(/^(\d{4}-\d{2}-\d{2})/);
    const ta = da ? new Date(da[1]).getTime() : 0;
    const tb = db ? new Date(db[1]).getTime() : 0;
    return tb - ta || b.name.localeCompare(a.name);
  });

  return {
    entries: mdFiles.map((f) => ({
      path: f.path,
      url: jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path, CV_BRANCH),
    })),
    updatedAt: Date.now(),
  };
}

async function loadLatestCvEntry() {
  const errorEl = $("#cv-error");
  const linkEl = $("#cv-latest-link");

  let idx = loadLocalCvCache();
  if (!idx) {
    try {
      idx = await fetchCvEntriesFromApi();
      saveLocalCvCache(idx);
    } catch (e) {
      console.error("CV fetch error", e);
      if (errorEl) {
        errorEl.textContent = "Couldn't load CV entries right now.";
        errorEl.style.display = "block";
      }
      return;
    }
  }

  if (!idx.entries || !idx.entries.length) {
    if (errorEl) {
      errorEl.textContent = "No CV entries found yet.";
      errorEl.style.display = "block";
    }
    return;
  }

  const entry = idx.entries[0];
  const r = await fetch(entry.url, { cache: "no-store" });
  if (!r.ok) {
    if (errorEl) {
      errorEl.textContent = "Could not load latest entry.";
      errorEl.style.display = "block";
    }
    return;
  }

  const md = await r.text();
  const { meta, body } = parseFrontMatter(md);

  const title =
    meta.title ||
    entry.path.replace(/^entries\//, "").replace(/\.md$/i, "");
  const dateStr =
    meta.date || (entry.path.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || "";
  const snippet = makeSnippet(body);
  const coverRel = extractFirstImage(body, meta.cover);
  const coverAbs = coverRel
    ? resolveCoverURL(entry.url, coverRel)
    : null;

  if (linkEl) {
    const entryId =
      (meta.id && String(meta.id).trim()) ||
      entry.path.replace(/^entries\//, "").replace(/\.md$/i, "");
    linkEl.href = `entry.html?id=${encodeURIComponent(entryId)}`;
  }

  setTextById("cv-title", title);
  setTextById("cv-date", dateStr);
  const snipEl = document.getElementById("cv-snippet");
  if (snipEl) snipEl.textContent = snippet;

  const cvImg = document.getElementById("cv-cover");
  if (cvImg) {
    if (coverAbs) {
      cvImg.src = coverAbs;
      cvImg.style.display = "";
      cvImg.onerror = () => {
        cvImg.style.display = "none";
      };
    } else {
      cvImg.style.display = "none";
    }
  }

  const badgeWrap = $("#cv-badges");
  if (badgeWrap) {
    badgeWrap.innerHTML = "";
    const mkBadge = (href, label) => {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noreferrer noopener";
      a.textContent = label;
      return a;
    };
    if (meta["links.linkedin"])
      badgeWrap.appendChild(mkBadge(meta["links.linkedin"], "LinkedIn"));
    if (meta["links.github"])
      badgeWrap.appendChild(mkBadge(meta["links.github"], "GitHub"));
  }

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

// ===== init =====
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadGithub();
  } catch (e) {
    console.error("GitHub load failed", e);
  }

  try {
    await loadPinnedProjects();
  } catch (e) {
    console.error("Featured projects load failed", e);
  }

  try {
    await loadLatestRepo();
  } catch (e) {
    console.error("Latest repo load failed", e);
  }

  try {
    await loadLinkedIn();
  } catch (e) {
    console.error("LinkedIn load failed", e);
  }

  try {
    await loadLatestCvEntry();
  } catch (e) {
    console.error("Latest CV entry load failed", e);
  }
});
