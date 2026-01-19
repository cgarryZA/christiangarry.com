/* =========================
   SHARED UTILITIES
   Used by index.js, cv.js, and entry.js
   ========================= */

// ===== DOM HELPERS =====
export const $ = (s) => document.querySelector(s);

// ===== URL/CDN HELPERS =====
export function jsDelivrRaw(owner, repo, path, ref = "main") {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
}

export function normSlashes(p) {
  return String(p || "").replace(/\\/g, "/");
}

export function dirnameFromRaw(rawUrl) {
  return rawUrl.replace(/\/[^/]*$/, "/");
}

export function repoRootFromRaw(rawUrl) {
  const m = rawUrl.match(
    /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+\/[^@]+@[^/]+)\//i
  );
  return m ? m[1] + "/" : dirnameFromRaw(rawUrl);
}

export function resolveCoverURL(rawMdUrl, cover) {
  if (!cover) return null;
  let c = normSlashes(cover).replace(/^\.\//, "");
  if (/^https?:\/\//i.test(c)) return c;

  const baseDir = dirnameFromRaw(rawMdUrl);
  const root = repoRootFromRaw(rawMdUrl);
  if (c.startsWith("assets/")) return root + c;
  return baseDir + c;
}

// Alias for entry.js compatibility
export const resolveAgainst = resolveCoverURL;

// ===== HTML ESCAPING =====
export function escapeHtml(s) {
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

// ===== FRONT MATTER PARSING =====
export function parseFrontMatter(md) {
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

// ===== MARKDOWN RENDERING =====

// Basic markdown to HTML (used by index.js featured projects)
export function mdToHtmlFeatured(mdRaw) {
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

// Standard markdown to HTML (used by cv.js and entry.js)
export function mdToHtml(mdRaw) {
  let md = String(mdRaw || "");

  // Strip CV-specific sections
  md = md.replace(
    /^\s*###\s*Short\s+CV\s+Snippet(?:\s*\(LaTeX\))?\s*[\r\n]+[\s\S]*$/gim,
    ""
  );

  // Strip code blocks
  md = md.replace(/```[\s\S]*?```/g, "");
  md = md.replace(/^\s*---\s*$/gm, "");

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
      /^<(h\d|ul|img|iframe)/i.test(block) ? block : `<p>${block}</p>`
    );

  return parts.join("\n");
}

// ===== TEXT UTILITIES =====
export function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Number formatter
export const nf = new Intl.NumberFormat();
