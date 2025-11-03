// ===== CONFIG =====
const GITHUB_USERNAME = "cgarryZA";
const LI_JSON_URL = "data/linkedin.json"; // manual JSON file

// CV repo config
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_CACHE_URL = "data/cv_cache.json"; // optional one-file cache in this repo
const CV_LOCAL_CACHE_KEY = "cv_index_cache_v1";
const CV_LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ---- helpers
const $ = (s) => document.querySelector(s);

function setText(id, t) {
  const el = document.getElementById(id);
  if (el != null) el.textContent = t;
}

function setLinkOrText(id, label, val, href) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!val) {
    el.style.display = "none";
    return;
  }
  el.innerHTML = href
    ? `${label}: <a href="${href}" target="_blank" rel="noreferrer noopener">${val}</a>`
    : `${label}: ${val}`;
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

function extractActivityId(url) {
  if (!url) return null;
  const m1 = url.match(/urn:li:activity:(\d+)/i);
  if (m1) return m1[1];
  const m2 = url.match(/activity[-:](\d+)/i);
  return m2 ? m2[1] : null;
}

const nf = new Intl.NumberFormat();

// ===== GitHub block =====
async function loadGithub() {
  const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  if (!r.ok) throw new Error(`GH profile ${r.status}`);
  const u = await r.json();

  const av = $("#avatar");
  if (av) av.src = u.avatar_url || `https://github.com/${GITHUB_USERNAME}.png`;
  setText("name", u.name || GITHUB_USERNAME);
  setText("login", "@" + (u.login || GITHUB_USERNAME));
  setText("bio", u.bio || "");

  setText("followers", `${nf.format(u.followers ?? 0)} followers`);
  setText("following", `${nf.format(u.following ?? 0)} following`);
  setText("public-repos", `${nf.format(u.public_repos ?? 0)} repos`);

  setLinkOrText("location", "📍 Location", u.location);
  setLinkOrText("company", "🏢 Company", u.company);

  let blog = u.blog;
  if (blog && !/^https?:\/\//i.test(blog)) blog = "https://" + blog;
  setLinkOrText("blog", "🔗 Website", blog, blog);

  // Set the invisible full-card link to GitHub profile
  const ghUrl = u.html_url || `https://github.com/${GITHUB_USERNAME}`;
  const ghA = document.getElementById("gh-url");
  if (ghA) ghA.href = ghUrl;

  // Green-Wall banner
  const gw = $("#gw");
  if (gw) {
    const qs = new URLSearchParams({ theme: "Classic" });
    gw.src = `https://green-wall.leoku.dev/api/og/share/${encodeURIComponent(
      GITHUB_USERNAME
    )}?${qs}`;
  }
}

// ===== Latest repo card =====
async function loadLatestRepo() {
  const r = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
  );
  if (!r.ok) return;
  const repos = (await r.json())
    .filter((x) => !x.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  const latest = repos[0];
  if (!latest) return;

  setText("repo-name", latest.name);
  const descEl = document.getElementById("repo-desc");
  if (descEl)
    descEl.innerHTML = latest.description
      ? escapeHtml(latest.description)
      : "No description";
  setText("repo-lang", latest.language ? `💻 ${latest.language}` : "");
  setText("repo-stars", `⭐ ${nf.format(latest.stargazers_count)}`);
  setText(
    "repo-updated",
    `🕒 Updated ${new Date(latest.pushed_at).toLocaleDateString()}`
  );

  const link = document.getElementById("latest-link");
  if (link) {
    link.href = latest.html_url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
  }
}

// ===== LinkedIn from local JSON =====
async function loadLinkedIn() {
  const r = await fetch(LI_JSON_URL, { cache: "no-store" });
  if (!r.ok) {
    console.warn("[LI] data/linkedin.json not found");
    return;
  }
  const j = await r.json();

  // avatar (distinct from GitHub)
  if (j.avatar) {
    const liAv = document.getElementById("li-avatar");
    if (liAv) liAv.src = j.avatar;
  }

  if (j.name) setText("li-name", j.name);
  if (j.handle) setText("li-handle", `/in/${j.handle}`);
  if (j.headline) setText("li-headline", j.headline);

  const profileUrl = j.handle
    ? `https://www.linkedin.com/in/${j.handle}/`
    : j.profile || "#";

  // Set the invisible full-card link to LinkedIn profile
  const liA = document.getElementById("li-url");
  if (liA) liA.href = profileUrl;

  if (Number.isFinite(j.followers))
    setText("li-followers", `${nf.format(j.followers)} followers`);
  if (Number.isFinite(j.connections))
    setText("li-connections", `${nf.format(j.connections)} connections`);

  // Latest post (optional, smaller embed)
  const postUrl = j.latestPost;
  const fb = document.getElementById("li-fallback");
  if (fb) fb.href = postUrl || profileUrl;

  const actId = extractActivityId(postUrl);
  if (!actId) return;

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${actId}?compact=1`;
  iframe.width = "100%";
  iframe.height = "360"; // smaller height
  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";

  const container = document.getElementById("li-embed");
  if (container) {
    container.innerHTML = "";
    container.appendChild(iframe);
  }
}

/* ========================
   LATEST CV ENTRY (from cgarryZA/CV)
   ======================== */

// simple YAML front-matter parser (first --- block)
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
      // strip quotes
      v = v.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      meta[k] = v;
    }
  });
  return { meta, body };
}

// find first image in markdown
function extractFirstImage(md, coverFromMeta) {
  if (coverFromMeta) return coverFromMeta;
  const m = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

// first paragraph snippet (text only)
function makeSnippet(md) {
  // remove code blocks for snippet
  const cleaned = md.replace(/```[\s\S]*?```/g, "").trim();
  const paras = cleaned
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  const first = paras.find((p) => p.length > 0) || "";
  // strip markdown links/images emphasis
  let text = first
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > 600) text = text.slice(0, 600).trim() + "…";
  return text || "—";
}

// jsDelivr raw url (CORS-friendly)
function jsDelivrRaw(owner, repo, path, ref = "main") {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
}

// try load one-file cache from repo
async function fetchCvCacheJson() {
  try {
    const r = await fetch(CV_CACHE_URL, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json(); // { entries: [{path, date, title, url, cover}], updatedAt }
  } catch {
    return null;
  }
}

// load / save localStorage cache
function loadLocalCache() {
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
function saveLocalCache(obj) {
  try {
    localStorage.setItem(CV_LOCAL_CACHE_KEY, JSON.stringify(obj));
  } catch {}
}

// get fresh list from GitHub API
async function fetchCvEntriesFromApi() {
  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  if (!r.ok) throw new Error(`CV list ${r.status}`);
  const files = await r.json(); // array of {name, path, download_url, ...}
  const mdFiles = files.filter((f) => /\.md$/i.test(f.name));
  // newest by date in filename if present
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
      url: jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path),
    })),
    updatedAt: Date.now(),
  };
}

// path utils for cover resolution
function normSlashes(p) {
  return String(p).replace(/\\/g, "/");
}
function dirnameFromRaw(rawUrl) {
  // e.g. https://cdn.jsdelivr.net/gh/owner/repo@ref/entries/file.md -> .../entries/
  return rawUrl.replace(/\/[^/]*$/, "/");
}
function repoRootFromRaw(rawUrl) {
  // https://cdn.jsdelivr.net/gh/owner/repo@ref/entries/file.md -> https://cdn.jsdelivr.net/gh/owner/repo@ref/
  const m = rawUrl.match(
    /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+\/[^@]+@[^/]+)\//i
  );
  return m ? m[1] + "/" : dirnameFromRaw(rawUrl);
}
function resolveCoverURL(rawMdUrl, cover) {
  if (!cover) return null;
  let c = normSlashes(cover).replace(/^\.\//, "");
  if (/^https?:\/\//i.test(c)) return c;

  const baseDir = dirnameFromRaw(rawMdUrl); // .../entries/
  const root = repoRootFromRaw(rawMdUrl); // .../@ref/

  // If author put cover at repo root "assets/...", use repo root
  if (c.startsWith("assets/")) return root + c;

  // Otherwise treat as relative to the entry's folder
  return baseDir + c;
}

async function loadLatestCvEntry() {
  const errorEl = $("#cv-error");

  // 1) try repo one-file cache
  let idx = await fetchCvCacheJson();

  // 2) else try localStorage cache
  if (!idx) idx = loadLocalCache();

  // 3) else fetch from GitHub API and remember in localStorage
  if (!idx) {
    try {
      idx = await fetchCvEntriesFromApi();
      saveLocalCache(idx);
    } catch (e) {
      if (errorEl) {
        errorEl.textContent = "Couldn’t load CV entries right now.";
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

  // fetch the first entry that has cv:true in front-matter (try a few to be safe)
  let chosen = null;
  for (let i = 0; i < Math.min(idx.entries.length, 10); i++) {
    const candidate = idx.entries[i];
    const r = await fetch(candidate.url, { cache: "no-store" });
    if (!r.ok) continue;
    const md = await r.text();
    const { meta, body } = parseFrontMatter(md);
    const cvFlag = String(meta.cv || "")
      .trim()
      .toLowerCase();
    const include =
      ["1", "true", "yes", "y", "on"].includes(cvFlag) ||
      (meta.publish &&
        String(meta.publish)
          .toLowerCase()
          .split(/[,;]/)
          .map((s) => s.trim())
          .includes("cv"));

    if (include) {
      chosen = { entry: candidate, meta, body, rawUrl: candidate.url };
      break;
    }
  }

  if (!chosen) {
    if (errorEl) {
      errorEl.textContent = "No recent CV entries marked cv: true.";
      errorEl.style.display = "block";
    }
    return;
  }

  const { entry, meta, body, rawUrl } = chosen;

  // derive fields
  const title = meta.title || entry.path.split("/").pop().replace(/\.md$/i, "");
  const dateStr =
    meta.date || (entry.path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? "");
  const coverRel = extractFirstImage(body, meta.cover);
  const coverAbs = coverRel ? resolveCoverURL(rawUrl, coverRel) : null;
  const snippet = makeSnippet(body);

  // populate card
  const linkEl = $("#cv-latest-link");
  if (linkEl) {
    const ghUrl = `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/main/${entry.path}`;
    linkEl.href = ghUrl;
  }

  setText("cv-title", title);
  setText("cv-date", dateStr ? new Date(dateStr).toLocaleDateString() : "");

  const cvImg = $("#cv-cover");
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

  setText("cv-snippet", snippet);

  // badges (LinkedIn/GitHub links) if present
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
    console.error(e);
  }
  try {
    await loadLatestRepo();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadLinkedIn();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadLatestCvEntry();
  } catch (e) {
    console.error(e);
  }
});
