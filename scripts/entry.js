/* =========================================================================
   entry.js — Updated: crosslinks support (id + optional label)
   ========================================================================= */

/* =========================
   IMPORTS
   ========================= */
import {
  $,
  jsDelivrRaw,
  resolveAgainst,
  escapeHtml,
  mdToHtml as mdToHtmlShared,
} from "./utils.js";

const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_BRANCH = "main";
const PLACEHOLDER_COVER = "assets/placeholder-cover.png";

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
  step(msg, extra) {
    if (LOG.on) console.log(`[entry] ${msg}`, extra ?? "");
  },
  warn(msg, extra) {
    if (LOG.on) console.warn(`[entry] ${msg}`, extra ?? "");
  },
  err(msg, extra) {
    console.error(`[entry] ${msg}`, extra ?? "");
  },
};

/* URL/path helpers now imported from utils.js */

/* =========================
   Normalize MD (kill gremlins)
   ========================= */
function normalizeMd(md) {
  return String(md)
    .replace(/\r\n/g, "\n")
    .replace(/\uFEFF/g, "") // BOM/ZWNBSP
    .replace(/\u00A0/g, " "); // NBSP → space
}

/* =========================
   Minimal YAML front matter parser (subset)
   - supports:
     key: value
     key: [a, b, c]
     key:
       - something
       - id: something
         label: something
   ========================= */
function parseYamlFrontMatter(raw) {
  const meta = {};
  const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");

  let i = 0;

  const stripQuotes = (v) =>
    String(v).trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

  const parseInlineList = (v) => {
    const m = v.match(/^\[(.*)\]$/);
    if (!m) return null;
    const inner = m[1].trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((x) => stripQuotes(x.trim()))
      .filter(Boolean);
  };

  const countIndent = (s) => (s.match(/^\s*/)?.[0]?.length ?? 0);

  while (i < lines.length) {
    let line = lines[i];
    i++;

    if (!line || /^\s*#/.test(line)) continue;

    const top = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!top) continue;

    const key = top[1].trim();
    let val = (top[2] ?? "").trim();

    // Inline list e.g. tags: [a, b]
    const inlineList = parseInlineList(val);
    if (inlineList) {
      meta[key] = inlineList;
      continue;
    }

    // Block/list starts if empty "key:"
    if (val === "") {
      const items = [];

      while (i < lines.length) {
        const next = lines[i];

        // blank lines inside blocks are fine
        if (!next.trim()) {
          i++;
          continue;
        }

        const indent = countIndent(next);
        if (indent === 0) break; // next top-level key

        const trimmed = next.trim();
        if (!trimmed.startsWith("- ")) break;

        const itemIndent = indent;
        let rest = trimmed.slice(2).trim(); // after "- "

        // If "- id: foo" start an object, then consume continuation lines:
        const kv = rest.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);

        if (kv) {
          const obj = {};
          obj[kv[1].trim()] = stripQuotes(kv[2] ?? "");

          i++; // consume the "- ..." line

          // Continuation lines belong to this list item if they are indented *more* than itemIndent
          while (i < lines.length) {
            const cont = lines[i];

            if (!cont.trim()) {
              i++;
              continue;
            }

            const contIndent = countIndent(cont);
            if (contIndent <= itemIndent) break; // next list item or top-level key

            const contTrim = cont.trim();
            const contKv = contTrim.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
            if (!contKv) break;

            obj[contKv[1].trim()] = stripQuotes(contKv[2] ?? "");
            i++;
          }

          items.push(obj);
          continue;
        }

        // Otherwise it's a scalar item: "- something"
        items.push(stripQuotes(rest));
        i++;
      }

      meta[key] = items;
      continue;
    }

    // Normal scalar value
    meta[key] = stripQuotes(val);
  }

  return meta;
}

/* =========================
   Front matter
   ========================= */
function parseFrontMatter(mdRaw) {
  const md = normalizeMd(mdRaw);
  if (!md.startsWith("---")) return { meta: {}, body: md };

  const end = md.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: md };

  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 4).replace(/^\s*\n/, "");

  const meta = parseYamlFrontMatter(raw);
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
  const to = endIdx == null ? md.length : endIdx;
  return md.slice(from, to).trim();
}
function splitHeadBody(mdRaw) {
  const md = normalizeMd(mdRaw);
  const markers = findMarkers(md);

  const shortIdx =
    markers.find((x) => x.name.startsWith("short cv snippet"))?.start ??
    md.length;

  const headMk = markers.find((x) => x.name === "head");
  const bodyMk = markers.find((x) => x.name === "body");

  const nextStartAfter = (idx) => {
    const next = markers
      .filter((x) => x.start > idx && !x.name.startsWith("short cv snippet"))
      .map((x) => x.start)
      .sort((a, b) => a - b)[0];
    return Math.min(next ?? md.length, shortIdx);
  };

  let headMd = "";
  let bodyMd = "";

  if (headMk) headMd = sliceBetween(md, headMk.start, nextStartAfter(headMk.start));
  if (bodyMk) bodyMd = sliceBetween(md, bodyMk.start, nextStartAfter(bodyMk.start));

  if (!headMk && !bodyMk) {
    bodyMd = md.slice(0, shortIdx).trim();
  } else if (headMk && !bodyMk) {
    bodyMd = md.slice(nextStartAfter(headMk.start), shortIdx).trim();
  }

  return { headMd, bodyMd };
}

/* =========================
   Minimal markdown renderer (using shared utility with normalization)
   ========================= */
function mdToHtml(mdRaw) {
  const md = normalizeMd(mdRaw);
  return mdToHtmlShared(md);
}

/* =========================
   YAML assets → embeds
   ========================= */
function listAttachments(meta) {
  const out = [];
  if (meta.asset) out.push(String(meta.asset));
  if (meta.assets) {
    if (Array.isArray(meta.assets)) out.push(...meta.assets.map(String));
    else
      String(meta.assets)
        .split(/[,;\r\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => out.push(s));
  }
  return out;
}
function isPdf(url) {
  return /\.pdf(\?.*)?$/i.test(url);
}
function isImage(url) {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
}

function renderAttachment(absUrl, container, coverUrl) {
  if (coverUrl && absUrl === coverUrl) return;

  if (isPdf(absUrl)) {
    const header = document.createElement("h3");
    header.textContent = "Document";
    header.style.marginTop = "2rem";
    container.appendChild(header);

    const ifr = document.createElement("iframe");
    ifr.className = "embed-pdf";
    ifr.src = `${absUrl}#toolbar=1&navpanes=0&zoom=page-width`;
    ifr.loading = "lazy";
    container.appendChild(ifr);

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
  const byId = u.searchParams.get("id");
  const byPath = u.searchParams.get("path");
  LOG.step("Query", { byId, byPath });

  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  if (!r.ok) throw new Error("Failed to list entries");
  const files = await r.json();
  const mdFiles = files.filter((f) => /\.md$/i.test(f.name));

  if (byPath) {
    const hit = mdFiles.find((f) => f.path === byPath);
    if (hit)
      return {
        path: hit.path,
        url: jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, hit.path, CV_BRANCH),
        mdFiles,
      };
  }

  for (const f of mdFiles) {
    const url = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path, CV_BRANCH);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) continue;
    const md = await resp.text();
    const { meta, body } = parseFrontMatter(md);
    if (byId && String(meta.id || "").trim() === byId)
      return { path: f.path, url, meta, body, mdFiles };
  }

  throw new Error("Entry not found");
}

/* =========================
   Crosslink helpers (id + optional label)
   ========================= */
function normalizeCrosslinks(meta) {
  const raw = meta.crosslinks;
  if (!raw || !Array.isArray(raw)) return [];

  const out = [];
  for (const x of raw) {
    if (typeof x === "string") {
      const id = x.trim();
      if (id) out.push({ id, label: "" });
      continue;
    }

    if (x && typeof x === "object") {
      // handles {id:"..."} or {id:"...", label:"..."} (what we want)
      const id = String(x.id ?? "").trim();
      const label = String(x.label ?? "").trim();
      if (id) out.push({ id, label });
    }
  }

  // de-dup by id (keep first that has a label if possible)
  const m = new Map();
  for (const item of out) {
    if (!m.has(item.id)) {
      m.set(item.id, item);
    } else {
      const existing = m.get(item.id);
      if (!existing.label && item.label) m.set(item.id, item);
    }
  }
  return Array.from(m.values());
}

async function resolveTitleForId(targetId, mdFiles, memo) {
  if (memo.has(targetId)) return memo.get(targetId);

  for (const f of mdFiles) {
    const url = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path, CV_BRANCH);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) continue;
    const md = await resp.text();
    const { meta } = parseFrontMatter(md);
    if (String(meta.id || "").trim() === targetId) {
      const title = meta.title || targetId;
      memo.set(targetId, title);
      return title;
    }
  }

  memo.set(targetId, targetId);
  return targetId;
}

function renderTopButtons(meta, entryPath, mdFiles) {
  const xlinks = $("#xlinks");
  const extlinks = $("#extlinks");
  if (xlinks) xlinks.innerHTML = "";
  if (extlinks) extlinks.innerHTML = "";

  // ---- Internal crosslinks (buttons)
  const items = normalizeCrosslinks(meta);
  const memo = new Map();

  (async () => {
    for (const item of items) {
      const label =
        item.label ||
        (await resolveTitleForId(item.id, mdFiles, memo)) ||
        item.id;

      const a = document.createElement("a");
      a.href = `entry.html?id=${encodeURIComponent(item.id)}`;
      a.target = "_blank";
      a.rel = "noreferrer noopener";
      a.className = "xbadge";
      a.textContent = label;
      if (xlinks) xlinks.appendChild(a);
    }
  })().catch((e) => LOG.warn("Crosslink render failed", e));

  // ---- External links (buttons)
  const addExt = (href, label) => {
    if (!href) return;
    const h = String(href).trim();
    if (!h) return;
    const a = document.createElement("a");
    a.href = h;
    a.target = "_blank";
    a.rel = "noreferrer noopener";
    a.className = "badge";
    a.textContent = label;
    if (extlinks) extlinks.appendChild(a);
  };

  // Always include source file on GitHub
  addExt(
    `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/${CV_BRANCH}/${entryPath}`,
    "View source on GitHub"
  );

  // Explicit external links from front matter (links.*)
  addExt(meta["links.github"], "GitHub");
  addExt(meta["links.linkedin"], "LinkedIn");

  // Any other links.* keys become buttons too
  Object.keys(meta)
    .filter(
      (k) =>
        k.startsWith("links.") &&
        k !== "links.github" &&
        k !== "links.linkedin"
    )
    .forEach((k) => {
      const label = k.replace(/^links\./, "").replace(/[-_]/g, " ");
      addExt(meta[k], label.charAt(0).toUpperCase() + label.slice(1));
    });
}

/* =========================
   INIT
   ========================= */
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const entry = await findEntryByQuery();

    let meta, body, rawUrl = entry.url;
    if (entry.meta) {
      meta = entry.meta;
      body = entry.body;
    } else {
      const resp = await fetch(entry.url, { cache: "no-store" });
      const md = await resp.text();
      ({ meta, body } = parseFrontMatter(md));
    }

    // Header
    $("#title").textContent = meta.title || "Untitled";
    $("#period").textContent = meta.period || meta.date || "";

    // Cover (small square in header)
    const firstImgInBody = body.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "";
    const coverRel = meta.cover || firstImgInBody;
    let coverAbs = coverRel ? resolveAgainst(rawUrl, coverRel) : null;
    if (!coverAbs) coverAbs = PLACEHOLDER_COVER;

    $("#cover").innerHTML = `<img src="${coverAbs}" alt="${escapeHtml(
      meta.title || ""
    )}" loading="lazy" decoding="async" />`;

    // Buttons under title/period (internal + external)
    renderTopButtons(meta, entry.path || "", entry.mdFiles || []);

    // Split & render
    const { headMd, bodyMd } = splitHeadBody(body);
    if (headMd) $("#head").innerHTML = mdToHtml(headMd);
    if (bodyMd) $("#body").innerHTML = mdToHtml(bodyMd);

    // YAML assets → embeds (skip cover if also listed)
    const atts = listAttachments(meta);
    if (atts.length) {
      const embeds = document.getElementById("embeds");
      if (embeds) {
        for (const rel of atts) {
          const abs = resolveAgainst(rawUrl, rel);
          if (abs) renderAttachment(abs, embeds, coverAbs);
        }
      }
    }
  } catch (e) {
    LOG.err("FATAL", e);
    const wrap = document.querySelector(".entry-wrap");
    if (wrap) wrap.innerHTML = `<p class="muted">Could not load this entry.</p>`;
  }
});
