// ===== IMPORTS =====
import {
  $,
  setTextById,
  escapeHtml,
  nf,
  mdToHtmlFeatured,
  jsDelivrRaw,
  parseFrontMatter,
  resolveCoverURL,
} from "./utils.js";

// ===== CONFIG =====
const GITHUB_USERNAME = "cgarryZA";
const LI_JSON_URL = "data/linkedin.json";
const PINNED_JSON_URL = "data/pinned_projects.json";

// CV repo config
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_BRANCH = "main";

// Bumped cache key so older cached entry lists don't stick for 24h after changes
const CV_LOCAL_CACHE_KEY = "cv_index_cache_v2";
const CV_LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

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

  //setTextById("net-gh-user", "@" + (u.login || GITHUB_USERNAME));
  //setTextById("net-gh-followers", `${nf.format(u.followers ?? 0)} followers`);
  //setTextById("net-gh-repos", `${nf.format(u.public_repos ?? 0)} repos`);

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
// Featured projects (pinned_projects.json + repo READMEs / COVER.md)
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

  // ===== PERFORMANCE FIX: Fetch all READMEs in parallel =====
  const fetchPromises = pins.map((pin) => {
    const owner = pin.owner || GITHUB_USERNAME;
    const repo = pin.repo;
    if (!repo) return Promise.resolve({ pin, readmeText: "" });

    const branch = pin.branch || "main";
    const readmePath = pin.readme || "README.md";

    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${readmePath}`;

    return fetch(rawUrl)
      .then((r) => (r.ok ? r.text() : ""))
      .then((readmeText) => ({ pin, readmeText }))
      .catch((e) => {
        console.warn("[Featured] README/COVER fetch error for", repo, e);
        return { pin, readmeText: "" };
      });
  });

  const results = await Promise.all(fetchPromises);

  // Render all cards with their fetched content
  for (const { pin, readmeText } of results) {
    const owner = pin.owner || GITHUB_USERNAME;
    const repo = pin.repo;
    if (!repo) continue;

    const title = pin.title || repo;

    const githubUrl =
      pin.githubUrl ||
      `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}`;

    // target for whole card: explicit target/url, else GitHub
    const targetUrl = pin.target || pin.url || githubUrl;

    // Make whole card an <a> so it's entirely clickable
    const card = document.createElement("a");
    card.className = "card featured-card";
    card.href = targetUrl;
    card.target = "_blank";
    card.rel = "noreferrer noopener";

    const inner = document.createElement("div");
    inner.className = "featured-inner";

    const h3 = document.createElement("h3");
    h3.className = "featured-title";
    h3.textContent = title;

    const meta = document.createElement("p");
    meta.className = "featured-meta";
    meta.innerHTML = `<span>View on GitHub</span>`;

    const body = document.createElement("div");
    body.className = "featured-body";
    body.innerHTML = readmeText
      ? mdToHtmlFeatured(readmeText)
      : "<p><em>Abstract not available.</em></p>";

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

function extractHeadParagraph(md) {
  if (!md) return "";

  // Find "### Head" section
  const headMatch = md.match(
    /###\s+Head\s*([\s\S]*?)(?:\n###\s+|$)/i
  );
  if (!headMatch) return "";

  let headBlock = headMatch[1].trim();

  // Remove the job title line (usually first markdown heading)
  headBlock = headBlock.replace(/^###.*$/m, "").trim();

  // Remove italic meta line (dates / location)
  headBlock = headBlock.replace(/^\*.*?\*\s*/m, "").trim();

  // First real paragraph only
  const para = headBlock.split(/\n\s*\n/)[0];

  return para.trim();
}

/**
 * Snippet generator:
 * - strips common CV section headings (Head/Body/Short CV Snippet) entirely
 * - strips markdown
 * - ensures we never start with "Head ..." on the landing card
 */
function makeSnippet(md) {
  let s = String(md || "");

  // Remove whole lines that are just these headings (before we collapse whitespace)
  // Handles: "# Head", "### Head", "### Short CV Snippet (LaTeX)", etc.
  s = s.replace(
    /^\s*#{1,6}\s*(Head|Body|Short\s+CV\s+Snippet(?:\s*\([^)]+\))?)\s*$/gim,
    ""
  );

  // Also nuke fenced code blocks & common markdown constructs
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/!\[[^\]]*]\([^)]+\)/g, "");
  s = s.replace(/\[[^\]]*]\([^)]+\)/g, (m) =>
    m.replace(/\[|\]|\([^)]*\)/g, "")
  );

  // Strip remaining heading markers (keeps the text)
  s = s.replace(/^#{1,6}\s+/gm, "");

  // Strip other markdown chars
  s = s.replace(/[*_`>]/g, "");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  // Final guard: if "Head" is still the very first token, remove it.
  // (Only at the beginning, so we don't delete legit uses of "head" later.)
  s = s.replace(/^Head\s*[-:–—]?\s+/i, "");

  if (s.length > 500) s = s.slice(0, 500).trim() + "…";
  return s || "—";
}

function extractFirstImage(md, coverFromMeta) {
  if (coverFromMeta) return coverFromMeta;
  const m = md.match(/!\[[^\]]*]\(([^)]+)\)/);
  return m ? m[1] : null;
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
    /* ignore */
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

  // Cache-bust the markdown fetch so CDNs never show stale content after updates
  const mdUrl = `${entry.url}?v=${Date.now()}`;

  const r = await fetch(mdUrl, { cache: "no-store" });
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
  const headPara = extractHeadParagraph(body);
  const snippet = headPara
    ? makeSnippet(headPara)
    : makeSnippet(body);
  const coverRel = extractFirstImage(body, meta.cover);
  const coverAbs = coverRel ? resolveCoverURL(entry.url, coverRel) : null;

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
  // ===== PERFORMANCE FIX: Load all sections in parallel =====
  const results = await Promise.allSettled([
    loadGithub(),
    loadPinnedProjects(),
    loadLatestRepo(),
    loadLinkedIn(),
    loadLatestCvEntry(),
  ]);

  // Log any failures
  const sectionNames = ["GitHub", "Featured projects", "Latest repo", "LinkedIn", "Latest CV entry"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`${sectionNames[i]} load failed:`, result.reason);
    }
  });
});
