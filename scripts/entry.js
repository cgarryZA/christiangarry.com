/* =========================================================================
   entry.js — Updated to properly display assets (PDFs and images)
   ========================================================================= */

const CV_REPO_OWNER   = "cgarryZA";
const CV_REPO_NAME    = "CV";
const CV_ENTRIES_DIR  = "entries";
const CV_BRANCH       = "main";
const PLACEHOLDER_COVER = "assets/placeholder-cover.png";

const $ = (s) => document.querySelector(s);

/* =========================
   Small, clear console logger
   ========================= */
const LOG = {
  on: true,
  snip(s, n = 160) {
    if (s == null) return "(null)";
    const str = String(s);
    return str.length <= n ? str : str.slice(0, n) + ` … [+${str.length - n}]`;
  },
  step(msg, extra) { if (LOG.on) console.log(`[entry] ${msg}`, extra ?? ""); },
  warn(msg, extra) { if (LOG.on) console.warn(`[entry] ${msg}`, extra ?? ""); },
  err(msg, extra)  { console.error(`[entry] ${msg}`, extra ?? ""); }
};

/* =========================
   URL/path helpers
   ========================= */
function jsDelivrRaw(owner, repo, path, ref = "main") {
  const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
  LOG.step("jsDelivrRaw()", url);
  return url;
}
function normSlashes(p) {
  return String(p || "").replace(/\\/g, "/");
}
function dirnameFromRaw(rawUrl) {
  return rawUrl.replace(/\/[^/]*$/, "/");
}
function repoRootFromRaw(rawUrl) {
  const m = rawUrl.match(/^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+\/[^@]+@[^/]+)\//i);
  return m ? m[1] + "/" : dirnameFromRaw(rawUrl);
}
function resolveAgainst(rawMdUrl, rel) {
  if (!rel) return null;
  let c = normSlashes(rel).replace(/^\.\//, "");
  if (/^https?:\/\//i.test(c)) return c;
  const baseDir = dirnameFromRaw(rawMdUrl);
  const root    = repoRootFromRaw(rawMdUrl);
  return c.startsWith("assets/") ? root + c : baseDir + c;
}

/* =========================
   Normalize MD (kill gremlins)
   ========================= */
function normalizeMd(md) {
  return String(md)
    .replace(/\r\n/g, "\n")
    .replace(/\uFEFF/g, "")   // BOM/ZWNBSP
    .replace(/\u00A0/g, " "); // NBSP → space
}

/* =========================
   Front matter
   ========================= */
function parseFrontMatter(md) {
  if (!md.startsWith("---")) return { meta: {}, body: md };
  const end = md.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: md };
  const raw  = md.slice(3, end).trim();
  const body = md.slice(end + 4).replace(/^\s*\r?\n/, "");
  const meta = {};
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!m) return;
    const k = m[1].trim();
    let v = m[2].trim();
    v = v.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    meta[k] = v;
  });
  return { meta, body };
}

/* =========================
   Marker slicing (robust)
   ========================= */
const MARKER_FLEX_RE =
  /^(?:[^\S\r\n]|\u00A0|\uFEFF)*###(?:[^\S\r\n]|\u00A0|\uFEFF)*(Head|Body|Short\s+CV\s+Snippet(?:[^\S\r\n]|\u00A0|\uFEFF)*\([^)]+\))?(?:[^\S\r\n]|\u00A0|\uFEFF)*$/gim;

function findMarkers(md) {
  const hits = [];
  MARKER_FLEX_RE.lastIndex = 0;
  let m;
  while ((m = MARKER_FLEX_RE.exec(md)) !== null) {
    const rawName = (m[1] || "").toLowerCase();
    const name = rawName.replace(/\s*\(.*?\)\s*$/, ""); // drop "(latex)"
    hits.push({ name, start: m.index });
  }
  return hits;
}
function lineEndAfter(idx, md) {
  const nl = md.indexOf("\n", idx);
  return nl === -1 ? md.length : nl + 1;
}
function sliceBetween(md, startIdx, endIdx) {
  const from = lineEndAfter(startIdx, md);
  const to   = endIdx == null ? md.length : endIdx;
  return md.slice(from, to).trim();
}
function splitHeadBody(mdRaw) {
  const md = normalizeMd(mdRaw);
  const markers = findMarkers(md);
  LOG.step("Markers found", markers);

  const shortIdx = markers.find(x => x.name.startsWith("short cv snippet"))?.start ?? md.length;

  const headMk = markers.find(x => x.name === "head");
  const bodyMk = markers.find(x => x.name === "body");

  const nextStartAfter = (idx) => {
    const next = markers
      .filter(x => x.start > idx && !x.name.startsWith("short cv snippet"))
      .map(x => x.start).sort((a,b)=>a-b)[0];
    return Math.min(next ?? md.length, shortIdx);
  };

  let headMd = "";
  let bodyMd = "";

  if (headMk) headMd = sliceBetween(md, headMk.start, nextStartAfter(headMk.start));
  if (bodyMk) bodyMd = sliceBetween(md, bodyMk.start, nextStartAfter(bodyMk.start));

  if (!headMk && !bodyMk) {
    LOG.warn("No Head/Body markers — using everything before Short CV as Body.");
    bodyMd = md.slice(0, shortIdx).trim();
  } else if (headMk && !bodyMk) {
    LOG.warn("Head present, Body missing — using remainder up to Short CV as Body.");
    bodyMd = md.slice(nextStartAfter(headMk.start), shortIdx).trim();
  }

  LOG.step("Head snippet", LOG.snip(headMd));
  LOG.step("Body snippet", LOG.snip(bodyMd));
  return { headMd, bodyMd };
}

/* =========================
   Minimal markdown renderer
   ========================= */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m])
  );
}
function renderInline(md) {
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`);
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(text)}</a>`);
  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return md;
}
function mdToHtml(mdRaw) {
  let md = normalizeMd(mdRaw);
  md = md.replace(/^\s*###\s*Short\s+CV\s+Snippet(?:\s*\(LaTeX\))?\s*[\r\n]+[\s\S]*$/gim, "");
  md = md.replace(/```[\s\S]*?```/g, "");
  md = md.replace(/^\s*---\s*$/gm, "");
  md = renderInline(md);
  md = md.replace(/^\s*###\s+(.+)$/gm, "<h3>$1</h3>");
  md = md.replace(/^\s*##\s+(.+)$/gm, "<h2>$1</h2>");
  md = md.replace(/^\s*#\s+(.+)$/gm, "<h1>$1</h1>");
  md = md.replace(/(^|\n)(- [^\n]+(?:\n- [^\n]+)*)/g, (full, lead, block) => {
    const items = block.split("\n").map(l => l.replace(/^- /, "").trim());
    const lis = items.map(txt => `<li>${txt}</li>`).join("");
    return `${lead}<ul>${lis}</ul>`;
  });
  const parts = md
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(b => (/^<(h\d|ul|img|iframe)/i.test(b) ? b : `<p>${b}</p>`));
  return parts.join("\n");
}

/* =========================
   YAML assets → embeds (UPDATED)
   ========================= */
function listAttachments(meta) {
  const out = [];
  if (meta.asset) out.push(String(meta.asset));
  if (meta.assets) {
    if (Array.isArray(meta.assets)) out.push(...meta.assets.map(String));
    else String(meta.assets).split(/[,;\r\n]+/).map(s => s.trim()).filter(Boolean).forEach(s => out.push(s));
  }
  return out;
}
function isPdf(url)   { return /\.pdf(\?.*)?$/i.test(url); }
function isImage(url) { return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url); }

function renderAttachment(absUrl, container, coverUrl) {
  LOG.step("Rendering attachment", absUrl);
  
  // Skip if this is the cover image
  if (coverUrl && absUrl === coverUrl) {
    LOG.step("Skipping cover image in attachments", absUrl);
    return;
  }
  
  if (isPdf(absUrl)) {
    LOG.step("Rendering PDF", absUrl);
    
    // Create section header
    const header = document.createElement("h3");
    header.textContent = "Document";
    header.style.marginTop = "2rem";
    container.appendChild(header);
    
    // Create iframe for PDF
    const ifr = document.createElement("iframe");
    ifr.className = "embed-pdf";
    ifr.src = `${absUrl}#toolbar=1&navpanes=0&zoom=page-width`;
    ifr.loading = "lazy";
    ifr.style.width = "100%";
    ifr.style.height = "600px";
    ifr.style.border = "1px solid #ddd";
    ifr.style.borderRadius = "8px";
    ifr.style.marginBottom = "1rem";
    container.appendChild(ifr);
    
    // Add download link
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl;
    a.textContent = "Open PDF in new tab";
    a.target = "_blank";
    a.rel = "noreferrer noopener";
    a.className = "badge";
    p.appendChild(a);
    container.appendChild(p);
    return;
  }
  
  if (isImage(absUrl)) {
    LOG.step("Rendering image", absUrl);
    
    // Create section header
    const header = document.createElement("h3");
    header.textContent = "Additional Image";
    header.style.marginTop = "2rem";
    container.appendChild(header);
    
    const img = document.createElement("img");
    img.src = absUrl;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "1rem";
    container.appendChild(img);
    return;
  }
  
  // Generic download link for other file types
  LOG.step("Rendering generic download", absUrl);
  const p = document.createElement("p");
  const a = document.createElement("a");
  a.href = absUrl;
  a.textContent = "Download attachment";
  a.target = "_blank";
  a.rel = "noreferrer noopener";
  a.className = "badge";
  p.appendChild(a);
  container.appendChild(p);
}

/* =========================
   Locate entry (?id= or ?path=)
   ========================= */
async function findEntryByQuery() {
  const u = new URL(location.href);
  const byId   = u.searchParams.get("id");
  const byPath = u.searchParams.get("path");
  LOG.step("Query", { byId, byPath });

  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  LOG.step("List status", r.status);
  if (!r.ok) throw new Error("Failed to list entries");
  const files = await r.json();
  const mdFiles = files.filter((f) => /\.md$/i.test(f.name));
  LOG.step("MD files count", mdFiles.length);

  if (byPath) {
    const hit = mdFiles.find((f) => f.path === byPath);
    if (hit) return { path: hit.path, url: jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, hit.path, CV_BRANCH) };
  }

  for (const f of mdFiles) {
    const url = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path, CV_BRANCH);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) continue;
    const md = await resp.text();
    const { meta, body } = parseFrontMatter(md);
    if (byId && String(meta.id || "").trim() === byId)
      return { path: f.path, url, meta, body };
  }
  throw new Error("Entry not found");
}

/* =========================
   INIT (UPDATED)
   ========================= */
window.addEventListener("DOMContentLoaded", async () => {
  try {
    LOG.step("DOMContentLoaded");
    const entry = await findEntryByQuery();
    LOG.step("Entry chosen", entry);

    let meta, body, rawUrl = entry.url;
    if (entry.meta) {
      meta = entry.meta;
      body = entry.body;
    } else {
      const resp = await fetch(entry.url, { cache: "no-store" });
      const md = await resp.text();
      ({ meta, body } = parseFrontMatter(md));
    }

    LOG.step("Meta", meta);
    LOG.step("Body length", body?.length);
    LOG.step("Body head", LOG.snip(body, 200));

    // Header
    $("#title").textContent  = meta.title || "Untitled";
    $("#period").textContent = meta.period || meta.date || "";

    // Cover (small, TL)
    const firstImgInBody = body.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "";
    const coverRel = meta.cover || firstImgInBody;
    let coverAbs = coverRel ? resolveAgainst(rawUrl, coverRel) : null;
    if (!coverAbs) coverAbs = PLACEHOLDER_COVER;
    $("#cover").innerHTML =
      `<img src="${coverAbs}" alt="${escapeHtml(meta.title || "")}" loading="lazy" decoding="async" style="max-width:120px;height:auto;border-radius:8px;object-fit:cover;" />`;

    // Split & render
    const { headMd, bodyMd } = splitHeadBody(body);
    LOG.step("Render head len", headMd.length);
    LOG.step("Render body len", bodyMd.length);

    if (headMd) $("#head").innerHTML = mdToHtml(headMd);
    if (bodyMd) $("#body").innerHTML = mdToHtml(bodyMd);

    // External link (GitHub)
    const ext = $("#extlinks");
    if (ext) {
      ext.innerHTML = "";
      const ghUrl = `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/${CV_BRANCH}/${entry.path || ""}`;
      const a = document.createElement("a");
      a.href = ghUrl; a.textContent = "View on GitHub";
      a.target = "_blank"; a.rel = "noreferrer noopener"; a.className = "badge";
      ext.appendChild(a);
    }

    // YAML assets (UPDATED to pass cover URL)
    const atts = listAttachments(meta);
    LOG.step("Attachments found", atts);
    if (atts.length) {
      const embeds = document.getElementById("embeds");
      if (embeds) {
        for (const rel of atts) {
          const abs = resolveAgainst(rawUrl, rel);
          LOG.step("Resolved attachment", { rel, abs });
          if (abs) renderAttachment(abs, embeds, coverAbs);
        }
      } else {
        LOG.warn("No #embeds container found in HTML");
      }
    }
  } catch (e) {
    LOG.err("FATAL", e);
    const wrap = document.querySelector(".entry-wrap");
    if (wrap) wrap.innerHTML = `<p class="muted">Could not load this entry.</p>`;
  }
});