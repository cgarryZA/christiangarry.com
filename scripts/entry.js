/* CONFIG shared with cv.js */
const CV_REPO_OWNER = "cgarryZA";
const CV_REPO_NAME = "CV";
const CV_ENTRIES_DIR = "entries";
const CV_BRANCH = "main";

const $ = (s) => document.querySelector(s);

function jsDelivrRaw(owner, repo, path, ref = "main") {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
}
function normSlashes(p) { return String(p || "").replace(/\\/g, "/"); }
function dirnameFromRaw(rawUrl) { return rawUrl.replace(/\/[^/]*$/, "/"); }
function repoRootFromRaw(rawUrl) {
  const m = rawUrl.match(/^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+\/[^@]+@[^/]+)\//i);
  return m ? m[1] + "/" : dirnameFromRaw(rawUrl);
}
function resolveAgainst(rawMdUrl, rel) {
  if (!rel) return null;
  let c = normSlashes(rel).replace(/^\.\//, "");
  if (/^https?:\/\//i.test(c)) return c;
  const baseDir = dirnameFromRaw(rawMdUrl); // .../entries/...
  const root = repoRootFromRaw(rawMdUrl);  // ...@ref/
  // If author put assets/ at repo root, honor that
  if (c.startsWith("assets/")) return root + c;
  // Else treat as entry-relative
  return baseDir + c;
}

// crude front-matter
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

function splitHeadBody(md) {
  // Looks for literal "### Head" and "### Body"
  const headMatch = md.match(/^\s*###\s+Head\s*$/m);
  const bodyMatch = md.match(/^\s*###\s+Body\s*$/m);
  if (!headMatch && !bodyMatch) {
    return { headMd: "", bodyMd: md.trim() };
  }
  let headMd = "", bodyMd = "";
  const lines = md.split(/\r?\n/);
  let section = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*###\s+Head\s*$/.test(line)) { section = "head"; continue; }
    if (/^\s*###\s+Body\s*$/.test(line)) { section = "body"; continue; }
    if (section === "head") headMd += line + "\n";
    else if (section === "body") bodyMd += line + "\n";
  }
  return { headMd: headMd.trim(), bodyMd: bodyMd.trim() };
}

// basic/safe-ish markdown -> HTML
function mdToHtml(md) {
  // code fences -> pre blocks
  md = md.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
  // images
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) =>
    `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`);
  // links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) =>
    `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(text)}</a>`);
  // bold/italic
  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // headings
  md = md.replace(/^\s*###\s+(.+)$/gm, "<h3>$1</h3>");
  md = md.replace(/^\s*##\s+(.+)$/gm, "<h2>$1</h2>");
  md = md.replace(/^\s*#\s+(.+)$/gm, "<h1>$1</h1>");
  // bullets (simple)
  md = md.replace(/(^|\n)-\s+(.+)(?=(\n-|\n\n|$))/g, (m, pfx, item) => `${pfx}<ul><li>${item.trim()}</li></ul>`);
  // paragraphs
  const parts = md.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).map(block => {
    if (/^<(h\d|pre|ul|img|iframe)/i.test(block)) return block;
    return `<p>${block}</p>`;
  });
  return parts.join("\n");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// turn <a href="...pdf"> into embedded viewers (kept, but your YAML asset(s) are added at the end)
function embedPdfs(html, baseRawUrl) {
  return html.replace(
    /<a href="([^"]+\.pdf)"[^>]*>(.*?)<\/a>/gi,
    (m, href, label) => {
      const abs = resolveAgainst(baseRawUrl, href);
      const viewer = `<iframe class="embed-pdf" src="${abs}#toolbar=1&navpanes=0&zoom=page-width"></iframe>`;
      const link = `<p><a class="badge" href="${abs}" target="_blank" rel="noreferrer noopener">Open PDF: ${escapeHtml(label)}</a></p>`;
      return `${viewer}\n${link}`;
    }
  );
}

// ----- NEW: read asset(s) from YAML and append at the END of the text -----
function listAttachments(meta) {
  // Support:
  // asset: "assets/file.pdf"  (string)
  // assets: ["assets/a.pdf", "assets/b.png"] (array or comma-separated)
  // Normalize to array of strings (may be empty)
  const out = [];
  if (meta.asset) out.push(String(meta.asset));
  if (meta.assets) {
    if (Array.isArray(meta.assets)) {
      for (const x of meta.assets) out.push(String(x));
    } else {
      // allow comma or newline separated string
      String(meta.assets)
        .split(/[,;\r\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => out.push(s));
    }
  }
  return out;
}
function isPdf(url) { return /\.pdf(\?.*)?$/i.test(url); }
function isImage(url) { return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url); }

function renderAttachment(absUrl, container) {
  if (isPdf(absUrl)) {
    const ifr = document.createElement("iframe");
    ifr.className = "embed-pdf";
    ifr.src = `${absUrl}#toolbar=1&navpanes=0&zoom=page-width`;
    ifr.loading = "lazy";
    container.appendChild(ifr);

    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl; a.textContent = "Open PDF"; a.target = "_blank"; a.rel = "noreferrer noopener";
    a.className = "badge";
    p.appendChild(a);
    container.appendChild(p);
    return;
  }
  if (isImage(absUrl)) {
    const img = document.createElement("img");
    img.src = absUrl;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    container.appendChild(img);
    return;
  }
  // fallback link
  const p = document.createElement("p");
  const a = document.createElement("a");
  a.href = absUrl; a.textContent = "Download attachment"; a.target = "_blank"; a.rel = "noreferrer noopener";
  a.className = "badge";
  p.appendChild(a);
  container.appendChild(p);
}

function makeBadge(href, label, cls="badge") {
  const a = document.createElement("a");
  a.href = href; a.target = "_blank"; a.rel = "noreferrer noopener";
  a.textContent = label; a.className = cls;
  return a;
}

async function findEntryByQuery() {
  const u = new URL(location.href);
  const byId = u.searchParams.get("id");
  const byPath = u.searchParams.get("path");
  const listUrl = `https://api.github.com/repos/${CV_REPO_OWNER}/${CV_REPO_NAME}/contents/${CV_ENTRIES_DIR}`;
  const r = await fetch(listUrl);
  if (!r.ok) throw new Error("Failed to list entries");
  const files = await r.json();
  const mdFiles = files.filter(f => /\.md$/i.test(f.name));
  // try path first
  if (byPath) {
    const hit = mdFiles.find(f => f.path === byPath);
    if (hit) return { path: hit.path, url: jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, hit.path, CV_BRANCH) };
  }
  // else fetch to find id
  for (const f of mdFiles) {
    const url = jsDelivrRaw(CV_REPO_OWNER, CV_REPO_NAME, f.path, CV_BRANCH);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) continue;
    const md = await resp.text();
    const { meta, body } = parseFrontMatter(md);
    if (byId && String(meta.id || "").trim() === byId) {
      return { path: f.path, url, meta, body };
    }
  }
  throw new Error("Entry not found");
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const entry = await findEntryByQuery();

    let meta, body, rawUrl = entry.url;
    if (entry.meta) { meta = entry.meta; body = entry.body; }
    else {
      const resp = await fetch(entry.url, { cache: "no-store" });
      const md = await resp.text();
      const parsed = parseFrontMatter(md);
      meta = parsed.meta; body = parsed.body;
    }

    // header
    $("#title").textContent = meta.title || "Untitled";
    $("#period").textContent = meta.period || meta.date || "";

    // cover
    const firstImgInBody = body.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1] ?? "";
    const coverRel = meta.cover || firstImgInBody;
    const coverAbs = coverRel ? resolveAgainst(rawUrl, coverRel) : null;
    if (coverAbs) {
      $("#cover").innerHTML = `<img src="${coverAbs}" alt="${meta.title || ""}" loading="lazy" decoding="async" />`;
    } else {
      $("#cover").innerHTML = "";
    }

    // split into Head / Body
    const { headMd, bodyMd } = splitHeadBody(body);
    if (headMd) $("#head").innerHTML = mdToHtml(headMd);
    if (bodyMd || body) $("#body").innerHTML = mdToHtml(bodyMd || body);

    // also embed PDFs referenced as links inside the text
    $("#head").innerHTML = embedPdfs($("#head").innerHTML, rawUrl);
    $("#body").innerHTML = embedPdfs($("#body").innerHTML, rawUrl);

    // crosslinks (YAML-based)
    const xwrap = $("#xlinks");
    xwrap.innerHTML = "";
    if (Array.isArray(meta.crosslinks)) {
      for (const ent of meta.crosslinks) {
        if (typeof ent === "string") {
          const id = ent.trim();
          const href = `entry.html?id=${encodeURIComponent(id)}`;
          xwrap.appendChild(makeBadge(href, id, "xbadge"));
        } else if (ent && typeof ent === "object") {
          const lbl = ent.label || ent.title || ent.id || "Link";
          let href = ent.url || null;
          if (!href && ent.id) href = `entry.html?id=${encodeURIComponent(ent.id)}`;
          if (href) xwrap.appendChild(makeBadge(href, lbl, "xbadge"));
        }
      }
    }

    // transcript + GitHub blob link
    const ext = $("#extlinks");
    ext.innerHTML = "";
    const ghUrl = `https://github.com/${CV_REPO_OWNER}/${CV_REPO_NAME}/blob/${CV_BRANCH}/${entry.path || ""}`;
    ext.appendChild(makeBadge(ghUrl, "View on GitHub"));

    // support transcript: {label, url} or links.transcript
    const tUrl = meta["links.transcript"] || (meta.transcript && meta.transcript.url);
    const tLabel = (meta.transcript && meta.transcript.label) || "Transcript";
    if (tUrl) {
      ext.appendChild(makeBadge(resolveAgainst(rawUrl, tUrl), tLabel));
    }

    // ---- NEW: append YAML asset(s) at the END of the text ----
    const atts = listAttachments(meta);
    if (atts.length) {
      const embeds = document.getElementById("embeds");
      for (const rel of atts) {
        const abs = resolveAgainst(rawUrl, rel);
        if (!abs) continue;
        renderAttachment(abs, embeds);
      }
    }

  } catch (e) {
    console.error(e);
    const wrap = document.querySelector(".entry-wrap");
    if (wrap) wrap.innerHTML = `<p class="muted">Could not load this entry.</p>`;
  }
});
