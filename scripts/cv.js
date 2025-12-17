/* =========================
   CONFIG
   ========================= */
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_HTML_PATH = "cv.html";
const CV_PDF_PATH = "cv.pdf";
const CV_BRANCH = "main";

// Optional static cache (only used as a fallback now)
const CV_CACHE_URL = "data/cv_cache.json";

// Bump the cache key so older filtered lists don’t stick around
const CV_LOCAL_CACHE_KEY = "cv_index_cache_v2";
const CV_LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const PLACEHOLDER_COVER = "assets/placeholder-cover.png";

/* =========================
   HELPERS
   ========================= */
const $ = (s) => document.querySelector(s);

function jsDelivrRaw(owner, repo, path, ref = "main") {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
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
  if (c.startsWith("assets/")) return root + c; // repo-root asset
  return baseDir + c; // entry-relative
}

/* ---------- Front matter ---------- */
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

/* ---------- ordering ---------- */
const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function parseFallbackDate(dateStr) {
  if (!dateStr) return new Date(1900, 0, 1);
  const fmts = [
    /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})[-\/](\d{2})$/,
    /^(\d{4})$/,
  ];
  for (const re of fmts) {
    const m = String(dateStr).match(re);
    if (m) {
      const y = +m[1],
        mo = m[2] ? +m[2] - 1 : 0,
        d = m[3] ? +m[3] : 1;
      return new Date(y, mo, d);
    }
  }
  return new Date(1900, 0, 1);
}

function parsePeriodStart(period, fallbackDate) {
  if (typeof period !== "string" || !period.trim())
    return parseFallbackDate(fallbackDate);
  const left = period.replace(/[—–]/g, "-").split("-", 1)[0].trim();
  const tokens = left.replace(",", " ").split(/\s+/).filter(Boolean);
  if (!tokens.length) return parseFallbackDate(fallbackDate);
  if (tokens.length >= 2) {
    const m = tokens[0].toLowerCase();
    const y = tokens.slice(1).find((t) => /^\d{4}$/.test(t));
    if (MONTHS[m] && y) return new Date(+y, MONTHS[m] - 1, 1);
  }
  if (/^\d{4}$/.test(tokens[0])) return new Date(+tokens[0], 0, 1);
  return parseFallbackDate(fallbackDate);
}

// sort by MOST RECENT ENDING DATE (treat Present as far future)
function parsePeriodEnd(period, fallbackDate) {
  if (typeof period !== "string" || !period.trim())
    return parseFallbackDate(fallbackDate);

  const norm = period.replace(/[—–]/g, "-");
  const parts = norm.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return parsePeriodStart(period, fallbackDate);

  const right = parts.slice(1).join("-").trim();
  if (/present|current|now/i.test(right)) return new Date(2100, 0, 1);

  const tokens = right.replace(",", " ").split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    const m = tokens[0].toLowerCase();
    const y = tokens.slice(1).find((t) => /^\d{4}$/.test(t));
    if (MONTHS[m] && y) return new Date(+y, MONTHS[m] - 1, 1);
  }
  if (/^\d{4}$/.test(tokens[0])) return new Date(+tokens[0], 11, 31);

  return parseFallbackDate(fallbackDate);
}

/* =========================================
   SECTION PARSER (robust marker scanner)
   ========================================= */
function scanMarkers(md) {
  const re =
    /^\s*###\s*(Head|Body|Short\s+CV\s+Snippet(?:\s*\(LaTeX\))?)\s*$/gim;
  const hits = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    hits.push({
      name: m[1].toLowerCase(),
      start: m.index,
      endOfLine: re.lastIndex,
    });
  }
  return hits;
}

function sliceBetween(md, startIdx, nextIdx) {
  const s = startIdx;
  const e = nextIdx === null || nextIdx === undefined ? md.length : nextIdx;
  const afterMarkerNL = md.indexOf("\n", s);
  const from = afterMarkerNL === -1 ? e : afterMarkerNL + 1;
  return md.slice(from, e).trim();
}

function splitHeadBody(md) {
  const markers = scanMarkers(md);
  if (!markers.length) return { headMd: md.trim(), bodyMd: "" };

  let headRange = null;
  let bodyRange = null;

  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i];
    const next = markers[i + 1];
    const nextStart = next ? next.start : md.length;

    if (cur.name.startsWith("head")) {
      headRange = sliceBetween(md, cur.start, nextStart);
    } else if (cur.name.startsWith("body")) {
      bodyRange = sliceBetween(md, cur.start, nextStart);
    } else if (cur.name.startsWith("short cv snippet")) {
      break;
    }
  }

  return { headMd: (headRange || "").trim(), bodyMd: (bodyRange || "").trim() };
}

/* ---------- strip helpers ---------- */
function stripShortCvSnippet(md) {
  return md
    .replace(
      /^\s*###\s*Short\s+CV\s+Snippet(?:\s*\(LaTeX\))?\s*[\r\n]+[\s\S]*$/gim,
      ""
    )
    .trim();
}
function stripSpecialBlockquotes(md) {
  return md
    .replace(/^\s*>\s*_?Cross-?linked\s+to[\s\S]*$/gim, "")
    .replace(/^\s*>\s*Transcript:\s*.*$/gim, "")
    .trim();
}

/* ---------- minimal markdown → HTML ---------- */
function mdToHtml(md) {
  md = stripShortCvSnippet(md);
  md = stripSpecialBlockquotes(md);
  md = md.replace(/```[\s\S]*?```/g, "");
  md = md.replace(/^\s*---\s*$/gm, "");

  md = md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`
  );

  md = md.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) =>
      `<a href="${escapeHtml(
        href
      )}" target="_blank" rel="noreferrer noopener">${escapeHtml(text)}</a>`
  );

  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  md = md.replace(/^\s*###\s+(.+)$/gm, "<h3>$1</h3>");
  md = md.replace(/^\s*##\s+(.+)$/gm, "<h2>$1</h2>");
  md = md.replace(/^\s*#\s+(.+)$/gm, "<h1>$1</h1>");

  md = md.replace(
    /(^|\n)-\s+(.+)(?=(\n-|\n\n|$))/g,
    (m, pfx, item) => `${pfx}<ul><li>${item.trim()}</li></ul>`
  );

  const parts = md
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => (/^<(h\d|ul|img)/i.test(block) ? block : `<p>${block}</p>`));

  return parts.join("\n");
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

/* teaser = first <p> block */
function firstParagraph(html) {
  const paras = html.match(/<p>[\s\S]*?<\/p>/i);
  return paras ? paras[0] : "";
}

/**
 * teaser text sanitiser:
 * - decodes common tag-entities like &lt;em&gt; so they don’t show as literal text
 * - strips tags entirely for the card preview (clean, clamped, consistent)
 */
function teaserToText(html) {
  let s = String(html || "");
  s = s.replace(/&lt;(\/?)(em|strong|i|b)&gt;/gi, "<$1$2>");
  s = s.replace(/<\/?[^>]+>/g, " ");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/* =========================
   BLOG VIEW (CV list)
   ========================= */
async function fetchCvCacheJson() {
  try {
    const r = await fetch(CV_CACHE_URL, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

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

async function fetchCvEntriesFromApi() {
  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  if (!r.ok) throw new Error(`CV list ${r.status}`);
  const files = await r.json();
  const mdFiles = files.filter((f) => /\.md$/i.test(f.name));

  // keep filename sort as a stable fallback, but we will re-sort later by period end
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

function makeBadge(href, label, className = "badge") {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noreferrer noopener";
  a.textContent = label;
  a.className = className;
  return a;
}

async function buildBlogCards() {
  const wrap = $("#cards");
  if (!wrap) return;
  wrap.innerHTML = "";

  // Prefer API (full list). Only use cv_cache.json as fallback.
  let idx = loadLocalCache();
  if (!idx) {
    try {
      idx = await fetchCvEntriesFromApi();
      saveLocalCache(idx);
    } catch {
      idx = (await fetchCvCacheJson()) || null;
    }
  }

  const entries = idx?.entries || [];
  if (!entries.length) {
    wrap.innerHTML = `<div class="muted">No CV entries found.</div>`;
    return;
  }

  const items = [];
  for (const e of entries) {
    const r = await fetch(e.url, { cache: "no-store" });
    if (!r.ok) continue;

    const md = await r.text();
    const { meta, body } = parseFrontMatter(md);

    // Split strictly by markers
    const { headMd, bodyMd } = splitHeadBody(body);

    // Teaser: Head paragraph if available; else first Body paragraph
    let teaserHtml = mdToHtml(headMd || "");
    if (!teaserHtml) {
      const bodyHtml = mdToHtml(bodyMd || body);
      teaserHtml = firstParagraph(bodyHtml);
    } else {
      teaserHtml = firstParagraph(teaserHtml);
    }
    const teaserText = teaserToText(teaserHtml);

    const coverRel =
      meta.cover || (body.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "");
    let coverAbs = coverRel ? resolveCoverURL(e.url, coverRel) : null;
    if (!coverAbs) coverAbs = PLACEHOLDER_COVER;

    const entryId =
      (meta.id && String(meta.id).trim()) ||
      e.path.replace(/^entries\//, "").replace(/\.md$/i, "");
    const entryUrl = `entry.html?id=${encodeURIComponent(entryId)}`;

    const start = parsePeriodStart(meta.period, meta.date);
    const end = parsePeriodEnd(meta.period, meta.date);

    items.push({
      title: meta.title || "Untitled",
      dateText: meta.period || meta.date || "",
      sortEnd: end,
      sortStart: start,
      coverAbs,
      teaserText,
      entryUrl,
      ghUrl: `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/${CV_BRANCH}/${e.path}`,
    });
  }

  // Sort by MOST RECENT END date (then start date as tie-break)
  items.sort(
    (a, b) =>
      b.sortEnd - a.sortEnd ||
      b.sortStart - a.sortStart ||
      b.title.localeCompare(a.title)
  );

  for (const it of items) {
    const card = document.createElement("article");
    card.className = "paper blog-card";
    card.style.position = "relative";

    const inner = document.createElement("div");
    inner.className = "paper-inner";

    const media = document.createElement("div");
    media.className = "paper-media";
    const img = document.createElement("img");
    img.className = "paper-cover";
    img.src = it.coverAbs;
    img.alt = it.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = () => {
      if (img.src.indexOf(PLACEHOLDER_COVER) === -1) img.src = PLACEHOLDER_COVER;
    };
    media.appendChild(img);

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "paper-body";

    const h3 = document.createElement("h3");
    h3.className = "paper-title";
    h3.textContent = it.title;

    const dateEl = document.createElement("div");
    dateEl.className = "paper-date muted";
    dateEl.textContent = it.dateText;

    const content = document.createElement("div");
    content.className = "paper-rich";
    content.textContent = it.teaserText || "—";

    const link = document.createElement("a");
    link.href = it.entryUrl;
    link.className = "stretched-link";
    link.setAttribute("aria-label", `Open ${it.title}`);

    bodyDiv.appendChild(h3);
    bodyDiv.appendChild(dateEl);
    bodyDiv.appendChild(content);
    
    inner.appendChild(media);
    inner.appendChild(bodyDiv);
    card.appendChild(inner);
    card.appendChild(link);
    wrap.appendChild(card);
  }
}

/* =========================
   INLINE CV VIEW (NO IFRAME)
   - Fetch cv.html from CV repo
   - Parse it
   - Inject into Shadow DOM so its CSS doesn't break your site
   - Rewrite ONLY `body { ... }` -> `.cv-root { ... }` so centering comes back
   ========================= */
function rewriteBodySelectorToCvRoot(cssText) {
  if (!cssText) return "";

  let out = cssText;

  // Rewrite body selector
  out = out.replace(/(^|[{\s,])body(\s*[,{])/gim, "$1.cv-root$2");
  out = out.replace(/(^|[{\s,])body(\s*\{)/gim, "$1.cv-root$2");

  // When embedded, neutralise page-level spacing
  out += `
    .cv-root {
      margin: 0 auto;
      padding: 48px 0;
    }
  `;

  return out;
}


async function initInlineCv() {
  const host = $("#cv-inline-host");
  const fallback = $("#cv-inline-fallback");
  const rawLink = $("#cv-raw-html-link");
  if (!host) return;

  const htmlUrl = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, CV_HTML_PATH, CV_BRANCH);
  if (rawLink) rawLink.href = htmlUrl;

  try {
    const r = await fetch(htmlUrl, { cache: "no-store" });
    if (!r.ok) throw new Error(`cv.html fetch ${r.status}`);
    const text = await r.text();

    // Parse as full document
    const doc = new DOMParser().parseFromString(text, "text/html");

    // Pull all <style> from head (your generator inlines CSS here)
    const styleTexts = Array.from(doc.querySelectorAll("head style"))
      .map((s) => s.textContent || "")
      .filter(Boolean);

    // Pull body content
    const bodyContent = doc.body ? doc.body.innerHTML : text;

    // Shadow DOM mount
    host.innerHTML = "";
    const shadow = host.attachShadow({ mode: "open" });

    // Base wrapper so rewritten `body {}` becomes `.cv-root {}`
    const wrapper = document.createElement("div");
    wrapper.className = "cv-root";
    wrapper.innerHTML = bodyContent;

    // Compose styles:
    // - your CV repo styles (with `body` rewritten)
    // - small safety resets so it sits nicely in your card
    const style = document.createElement("style");
    const rewritten = styleTexts.map(rewriteBodySelectorToCvRoot).join("\n\n");

    style.textContent = `
/* Host safety */
:host { display:block; width:100%; }
.cv-root { width:100%; }

/* Slightly reduce weird inherited site styles */
.cv-root * { box-sizing: border-box; }
.cv-root img { max-width: 100%; height: auto; }

/* ===== CV repo inline CSS (rewritten) ===== */
${rewritten}
`;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    if (fallback) fallback.style.display = "none";
  } catch (err) {
    console.warn("[CV] Inline CV load failed:", err);
    if (fallback) fallback.style.display = "";
  }
}

/* =========================
   PDF DOWNLOAD
   ========================= */
function initPdfDownload() {
  const link = $("#download-pdf");
  if (!link) return;
  link.href = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, CV_PDF_PATH, CV_BRANCH);
}

/* =========================
   TOGGLE
   ========================= */
function initToggle() {
  const btn = $("#toggle");
  const cvView = $("#cv-view");
  const blog = $("#blog-view");
  if (!btn || !cvView || !blog) return;

  btn.addEventListener("click", async () => {
    const isBlog = btn.getAttribute("aria-pressed") === "true";
    const next = !isBlog;
    btn.setAttribute("aria-pressed", String(next));
    btn.querySelector("span").textContent = next ? "CV view" : "Blog view";

    if (next) {
      cvView.style.display = "none";
      blog.style.display = "";
      if (!blog.dataset.built) {
        await buildBlogCards();
        blog.dataset.built = "1";
      }
    } else {
      blog.style.display = "none";
      cvView.style.display = "";
    }
  });
}

/* =========================
   INIT
   ========================= */
window.addEventListener("DOMContentLoaded", async () => {
  initPdfDownload();
  initToggle();
  await initInlineCv();

  const hash = (window.location.hash || "").toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const wantBlog = hash === "#blog" || params.get("view") === "blog";

  if (wantBlog) {
    const btn = $("#toggle");
    if (btn) btn.click();
  }
});
