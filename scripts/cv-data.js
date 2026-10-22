const siteRoot = new URL("../", import.meta.url);

export const publicCvUrls = Object.freeze({
  entries: new URL("public-cv/entries.json", siteRoot).href,
  html: new URL("public-cv/cv.html", siteRoot).href,
  pdf: new URL("public-cv/cv.pdf", siteRoot).href,
});

const approvedCovers = new Set([
  "/public-cv/assets/siemens_logo.jpeg",
  "/public-cv/assets/durham_university_logo.jpeg",
]);
const entryIdPattern = /^[a-z0-9][a-z0-9_-]{0,119}$/i;
const entryPathPattern = /^entries\/[a-z0-9][a-z0-9_.-]*\.md$/i;
let publicCvPromise;

export function clearLegacyCvCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (/^cv_(?:index_)?cache(?:_|$)/i.test(key || "")) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // The public snapshot does not require browser storage.
  }
}

clearLegacyCvCache();

export function safeCoverUrl(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value, siteRoot);
    return url.origin === siteRoot.origin && approvedCovers.has(url.pathname) && !url.search && !url.hash && !url.username && !url.password
      ? url.href : "";
  } catch { return ""; }
}

function publicLinkUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (!["https:", "mailto:"].includes(url.protocol)) return "";
    if (url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

function stringField(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePublicCv(data) {
  if (data?.version !== 1 || !Array.isArray(data.entries)) {
    throw new Error("Unsupported public CV snapshot");
  }
  const ids = new Set();
  const paths = new Set();
  const entries = data.entries.map((item) => {
    if (!item || typeof item.id !== "string" || !entryIdPattern.test(item.id) || !stringField(item.title)) {
      throw new Error("Invalid public CV entry");
    }
    const path = stringField(item.path);
    if (path && !entryPathPattern.test(path)) throw new Error("Invalid entry path");
    if (ids.has(item.id) || (path && paths.has(path))) throw new Error("Duplicate public CV entry");
    ids.add(item.id);
    if (path) paths.add(path);
    return Object.freeze({
      id: item.id,
      path,
      title: stringField(item.title),
      period: stringField(item.period),
      date: stringField(item.date),
      section: stringField(item.section),
      summary: stringField(item.summary),
      head: stringField(item.head),
      body: stringField(item.body),
      cover: safeCoverUrl(item.cover),
      links: Object.freeze((Array.isArray(item.links) ? item.links : []).flatMap((link) => {
        const label = stringField(link?.label);
        const url = publicLinkUrl(link?.url);
        return label && url ? [Object.freeze({ label, url })] : [];
      })),
    });
  });
  return Object.freeze({
    version: 1,
    highlight: ids.has(data.highlight) ? data.highlight : "",
    entries: Object.freeze(entries),
  });
}

export async function fetchPublicCvFile(url) {
  if (!Object.values(publicCvUrls).includes(url)) throw new Error("Unknown public CV file");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      mode: "same-origin",
      credentials: "omit",
      redirect: "error",
      cache: "no-cache",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Public CV unavailable (${response.status})`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function loadPublicCv() {
  if (!publicCvPromise) {
    publicCvPromise = fetchPublicCvFile(publicCvUrls.entries)
      .then((text) => validatePublicCv(JSON.parse(text)))
      .catch((error) => {
        publicCvPromise = undefined;
        throw error;
      });
  }
  return publicCvPromise;
}

export function entryHref(entry) {
  return `entry.html?id=${encodeURIComponent(entry.id)}`;
}

export function readEntryQuery(search) {
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const path = params.get("path");
  if (params.getAll("id").length > 1 || params.getAll("path").length > 1) return null;
  if (!id && !path) return null;
  if ((id && !entryIdPattern.test(id)) || (path && !entryPathPattern.test(path))) return null;
  return { id, path };
}

export function findPublicEntry(entries, query) {
  if (!query) return undefined;
  return entries.find((entry) =>
    (!query.id || entry.id === query.id) && (!query.path || entry.path === query.path)
  );
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function approvedMarkdownLink(value, entry, entries) {
  const publicUrl = publicLinkUrl(value);
  if (publicUrl && entry.links.some((link) => link.url === publicUrl)) return publicUrl;
  try {
    const url = new URL(value, siteRoot);
    const entryUrl = new URL("entry.html", siteRoot);
    if (url.origin === entryUrl.origin && url.pathname === entryUrl.pathname) {
      const target = findPublicEntry(entries, readEntryQuery(url.search));
      if (target) return entryHref(target);
    }
  } catch {
    // Unapproved destinations remain plain text.
  }
  return "";
}

function inlineMarkdown(text, entry, entries) {
  const tokens = /!\[([^\]]*)\]\([^\n)]*\)|\[([^\]]+)\]\(([^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_/g;
  let output = "";
  let cursor = 0;
  for (const match of text.matchAll(tokens)) {
    output += escapeHtml(text.slice(cursor, match.index));
    if (match[0].startsWith("!")) {
      // Entry prose cannot load media; covers are separately allowlisted.
      output += escapeHtml(match[1]);
    } else if (match[2]) {
      const href = approvedMarkdownLink(match[3], entry, entries);
      const label = escapeHtml(match[2]);
      const external = href.startsWith("https:");
      output += href
        ? `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`
        : label;
    } else if (match[4]) {
      output += `<code>${escapeHtml(match[4])}</code>`;
    } else if (match[5] || match[6]) {
      output += `<strong>${escapeHtml(match[5] || match[6])}</strong>`;
    } else {
      output += `<em>${escapeHtml(match[7] || match[8])}</em>`;
    }
    cursor = match.index + match[0].length;
  }
  return output + escapeHtml(text.slice(cursor));
}

export function renderEntryMarkdown(markdown, entry, entries) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let listType = "";
  let codeLines = null;
  const inline = (text) => inlineMarkdown(text, entry, entries);
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = "";
  };
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushParagraph();
      closeList();
      if (codeLines) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else codeLines = [];
      continue;
    }
    if (codeLines) { codeLines.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^\s*(#{1,6})\s+(.+)$/);
    const listItem = line.match(/^\s*(?:([-+*])|\d+[.)])\s+(.+)$/);
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = Math.max(2, heading[1].length);
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (listItem) {
      flushParagraph();
      const type = listItem[1] ? "ul" : "ol";
      if (type !== listType) { closeList(); output.push(`<${type}>`); listType = type; }
      output.push(`<li>${inline(listItem[2])}</li>`);
    } else if (quote) {
      flushParagraph(); closeList();
      output.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
    } else {
      closeList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph(); closeList();
  if (codeLines) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  return output.join("\n");
}
