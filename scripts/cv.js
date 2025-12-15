/* =========================
   CONFIG
   ========================= */
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_BRANCH = "main";

const CV_PDF_PATH = "Christian_Timothy_Thomas_Garry_CV.pdf";

// Where entry markdown lives in your CV repo
const CV_ENTRIES_DIR = "entries";

// Optional: if you have a generated cache file you host (else it silently falls back)
const CV_CACHE_URL = "data/cv_cache.json";

// Local cache (list of entry files) to avoid hitting GitHub API too hard
const CV_LOCAL_CACHE_KEY = "cv_index_cache_v2";
const CV_LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const PLACEHOLDER_COVER = "assets/placeholder-cover.jpg";

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
  if (c.startsWith("assets/")) return root + c;
  return baseDir + c;
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

/* Minimal markdown -> HTML for entry teasers */
function mdToHtml(mdRaw) {
  let md = String(mdRaw || "");

  // strip fenced code blocks
  md = md.replace(/```[\s\S]*?```/g, "");

  // images -> drop from teaser (cover is handled separately)
  md = md.replace(/!\[[^\]]*]\([^)]+\)/g, "");

  // links -> keep label only
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text) => escapeHtml(text));

  // bold / italic
  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // headings -> keep text
  md = md.replace(/^\s*#{1,6}\s+/gm, "");

  // bullet lists -> simple
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
      /^<(ul)/i.test(block) ? block : `<p>${escapeHtml(block)}</p>`
    );

  return parts.join("\n");
}

/* teaser = first <p> block */
function firstParagraph(html) {
  const paras = html.match(/<p>[\s\S]*?<\/p>/i);
  return paras ? paras[0] : "";
}

/* Front-matter parser (simple key: value lines) */
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

/* Split body into Head / Body sections if you use those markers */
function splitHeadBody(body) {
  const s = String(body || "");
  const headIdx = s.search(/^\s*###\s*Head\s*$/im);
  const bodyIdx = s.search(/^\s*###\s*Body\s*$/im);

  // If markers not found, treat whole thing as body
  if (headIdx === -1 && bodyIdx === -1) return { headMd: "", bodyMd: s };

  let headMd = "";
  let bodyMd = "";

  if (headIdx !== -1) {
    const headStart = s.slice(headIdx).replace(/^\s*###\s*Head\s*$/im, "");
    if (bodyIdx !== -1 && bodyIdx > headIdx) {
      headMd = headStart.slice(0, bodyIdx - headIdx).trim();
      bodyMd = s.slice(bodyIdx).replace(/^\s*###\s*Body\s*$/im, "").trim();
    } else {
      headMd = headStart.trim();
    }
  } else if (bodyIdx !== -1) {
    bodyMd = s.slice(bodyIdx).replace(/^\s*###\s*Body\s*$/im, "").trim();
  }

  return { headMd, bodyMd };
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

  let idx = (await fetchCvCacheJson()) || loadLocalCache();
  if (!idx) {
    idx = await fetchCvEntriesFromApi();
    saveLocalCache(idx);
  }

  const entries = idx.entries || [];
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

    // ✅ IMPORTANT: include ALL entries (ignore cv:true entirely)

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

    const coverRel =
      meta.cover || (body.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "");
    let coverAbs = coverRel ? resolveCoverURL(e.url, coverRel) : null;
    if (!coverAbs) coverAbs = PLACEHOLDER_COVER;

    const entryId =
      (meta.id && String(meta.id).trim()) ||
      e.path.replace(/^entries\//, "").replace(/\.md$/i, "");
    const entryUrl = `entry.html?id=${encodeURIComponent(entryId)}`;

    items.push({
      title: meta.title || "Untitled",
      dateText: meta.period || meta.date || "",
      sortDate: parsePeriodStart(meta.period, meta.date),
      coverAbs,
      teaserHtml,
      entryUrl,
      ghUrl: `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/${CV_BRANCH}/${e.path}`,
    });
  }

  // Newest first
  items.sort((a, b) => b.sortDate - a.sortDate);

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
      if (img.src.indexOf(PLACEHOLDER_COVER) === -1)
        img.src = PLACEHOLDER_COVER;
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
    content.innerHTML = it.teaserHtml;

    const badges = document.createElement("div");
    badges.className = "paper-badges";
    badges.appendChild(makeBadge(it.ghUrl, "View on GitHub"));

    // Whole card clickable
    const link = document.createElement("a");
    link.href = it.entryUrl;
    link.className = "stretched-link";
    link.setAttribute("aria-label", `Open ${it.title}`);

    bodyDiv.appendChild(h3);
    bodyDiv.appendChild(dateEl);
    bodyDiv.appendChild(content);
    bodyDiv.appendChild(badges);

    inner.appendChild(media);
    inner.appendChild(bodyDiv);
    card.appendChild(inner);
    card.appendChild(link);
    wrap.appendChild(card);
  }
}

/* =========================
   PDF VIEW + TOGGLE
   ========================= */
function initPdfView() {
  const frame = $("#cv-frame");
  const rawLink = $("#cv-raw-link");
  if (!frame) return;

  const pdfUrl = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, CV_PDF_PATH, CV_BRANCH);
  frame.src = pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width";
  if (rawLink) rawLink.href = pdfUrl;
}

function initToggle() {
  const btn = $("#toggle");
  const pdf = $("#pdf-view");
  const blog = $("#blog-view");
  if (!btn || !pdf || !blog) return;

  btn.addEventListener("click", async () => {
    const isBlog = btn.getAttribute("aria-pressed") === "true";
    const next = !isBlog;

    btn.setAttribute("aria-pressed", String(next));
    btn.querySelector("span").textContent = next ? "PDF view" : "Blog view";

    if (next) {
      pdf.style.display = "none";
      blog.style.display = "";
      if (!blog.dataset.built) {
        await buildBlogCards();
        blog.dataset.built = "1";
      }
    } else {
      blog.style.display = "none";
      pdf.style.display = "";
    }
  });
}

/* =========================
   INIT
   ========================= */
window.addEventListener("DOMContentLoaded", async () => {
  initPdfView();
  initToggle();

  // If URL is cv.html#blog or cv.html?view=blog, start in blog view directly
  const hash = (window.location.hash || "").toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const wantBlog = hash === "#blog" || params.get("view") === "blog";

  if (wantBlog) {
    const btn = document.querySelector("#toggle");
    const pdf = document.querySelector("#pdf-view");
    const blog = document.querySelector("#blog-view");
    if (btn && pdf && blog) {
      btn.setAttribute("aria-pressed", "true");
      const span = btn.querySelector("span");
      if (span) span.textContent = "PDF view";

      pdf.style.display = "none";
      blog.style.display = "";

      if (!blog.dataset.built) {
        await buildBlogCards();
        blog.dataset.built = "1";
      }
    }
  }
});
