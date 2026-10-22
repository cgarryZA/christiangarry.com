import {
  entryHref,
  fetchPublicCvFile,
  loadPublicCv,
  publicCvUrls,
} from "./cv-data.js";

let entriesLoaded = false;

function cardForEntry(entry) {
  const card = document.createElement("article");
  card.className = "paper entry-card";
  const inner = document.createElement("div");
  inner.className = "paper-inner";
  if (entry.cover) {
    const media = document.createElement("div");
    media.className = "paper-media";
    const image = document.createElement("img");
    image.className = "paper-cover";
    image.src = entry.cover;
    image.alt = "";
    image.width = 120;
    image.height = 120;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => media.remove(), { once: true });
    media.append(image);
    inner.append(media);
  }
  const body = document.createElement("div");
  body.className = "paper-body";
  const title = document.createElement("h3");
  title.className = "paper-title";
  const link = document.createElement("a");
  link.className = "stretched-link";
  link.href = entryHref(entry);
  link.textContent = entry.title;
  title.append(link);
  const date = document.createElement("p");
  date.className = "paper-date muted";
  date.textContent = [entry.period || entry.date, entry.section].filter(Boolean).join(" · ");
  const summary = document.createElement("p");
  summary.className = "paper-rich";
  summary.textContent = entry.summary;
  body.append(title, date, summary);
  inner.append(body);
  card.append(inner);
  return card;
}

async function loadEntries() {
  const cards = document.getElementById("cards");
  const status = document.getElementById("entries-status");
  if (entriesLoaded) return;
  entriesLoaded = true;
  cards.setAttribute("aria-busy", "true");
  status.hidden = false;
  status.textContent = "Loading entries…";
  try {
    const { entries } = await loadPublicCv();
    cards.replaceChildren(...entries.map(cardForEntry));
    status.textContent = entries.length ? `${entries.length} entries.` : "No entries are available yet.";
    status.classList.toggle("visually-hidden", entries.length > 0);
  } catch {
    entriesLoaded = false;
    status.classList.remove("visually-hidden");
    status.replaceChildren(document.createTextNode("Entries could not be loaded. "));
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "cv-toggle";
    retry.textContent = "Try again";
    retry.addEventListener("click", loadEntries);
    status.append(retry);
  } finally {
    cards.setAttribute("aria-busy", "false");
  }
}

function prepareInlineCv(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const content = template.content;
  const styles = [...content.querySelectorAll("style")].map((style) => style.textContent).join("\n");
  const css = styles
    .replace(/@import\s+[^;]+;/gi, "")
    .replace(/url\s*\([^)]*\)/gi, "none")
    .replace(/(^|[},\s])(?:html|body)(?=[\s,{.:#>])/gim, "$1.cv-root");
  const allowedTags = new Set([
    "A", "ABBR", "ADDRESS", "ARTICLE", "B", "BLOCKQUOTE", "BR", "CAPTION", "CODE", "COL", "COLGROUP", "DD", "DIV", "DL", "DT", "EM", "FOOTER",
    "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HR", "I", "LI", "MAIN", "OL", "P", "PRE", "S", "SECTION", "SMALL", "SPAN",
    "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL",
  ]);
  for (const node of content.querySelectorAll("*")) {
    if (!allowedTags.has(node.tagName)) node.remove();
  }
  const allowedAttributes = new Set(["class", "id", "href", "colspan", "rowspan", "scope", "aria-label"]);
  for (const element of content.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (!allowedAttributes.has(attribute.name)) element.removeAttribute(attribute.name);
    }
    if (element.hasAttribute("href")) {
      try {
        const url = new URL(element.getAttribute("href"), publicCvUrls.html);
        if (!["https:", "mailto:", "tel:"].includes(url.protocol)) element.removeAttribute("href");
        else {
          element.setAttribute("href", url.href);
          if (url.protocol === "https:") {
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noopener noreferrer");
          }
        }
      } catch { element.removeAttribute("href"); }
    }
  }
  return { css, body: content };
}

async function loadInlineCv() {
  const host = document.getElementById("cv-inline-host");
  const status = document.getElementById("cv-inline-status");
  const fallback = document.getElementById("cv-inline-fallback");
  host.setAttribute("aria-busy", "true");
  try {
    const { css, body } = prepareInlineCv(await fetchPublicCvFile(publicCvUrls.html));
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `${css}
      :host { display: block; }
      .cv-root { max-width: 900px; margin: 0 auto; padding: 16px 0; overflow-wrap: anywhere; }
      .cv-root a:focus-visible { outline: 2px solid #0d9488; outline-offset: 3px; }
      .cv-root.cv-dark { color: #e2e8f0; background: #1e293b; }
      .cv-root.cv-dark h1, .cv-root.cv-dark h2, .cv-root.cv-dark h3 { color: #f1f5f9; border-color: rgba(255,255,255,.18); }
      .cv-root.cv-dark a { color: #2dd4bf; }
      .cv-root.cv-dark hr, .cv-root.cv-dark td, .cv-root.cv-dark th { border-color: rgba(255,255,255,.12); }
      @media (max-width: 600px) {
        .cv-root .entry-header, .cv-root .leadership-item { grid-template-columns: 1fr; gap: 2px; }
        .cv-root .entry-right, .cv-root .leadership-right { text-align: left; white-space: normal; }
        .cv-root .header h1 { font-size: 28px; }
      }
    `;
    const root = document.createElement("div");
    root.className = "cv-root";
    root.append(...[...body.childNodes].map((node) => document.importNode(node, true)));
    shadow.replaceChildren(style, root);
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const theme = document.documentElement.dataset.theme;
      root.classList.toggle("cv-dark", theme === "dark" || (!theme && preference.matches));
    };
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    preference.addEventListener("change", applyTheme);
    status.hidden = true;
  } catch {
    status.textContent = "The CV preview could not be loaded.";
    fallback.hidden = false;
  } finally {
    host.setAttribute("aria-busy", "false");
  }
}

function setView(entriesVisible) {
  const toggle = document.getElementById("toggle");
  document.getElementById("cv-view").hidden = entriesVisible;
  document.getElementById("entries-view").hidden = !entriesVisible;
  toggle.setAttribute("aria-pressed", String(entriesVisible));
  toggle.textContent = entriesVisible ? "CV view" : "Entries";
  toggle.setAttribute("aria-label", entriesVisible ? "Show CV view" : "Show CV entries");
  if (entriesVisible) loadEntries();
}

function entriesRequested() {
  const requestedView = new URLSearchParams(location.search).get("view");
  return ["#entries", "#blog"].includes(location.hash) || ["entries", "blog"].includes(requestedView);
}

function init() {
  document.getElementById("download-pdf").href = publicCvUrls.pdf;
  document.getElementById("cv-raw-html-link").href = publicCvUrls.html;
  document.getElementById("toggle").addEventListener("click", () => {
    const entriesVisible = document.getElementById("entries-view").hidden;
    const url = new URL(location.href);
    url.searchParams.delete("view");
    url.hash = entriesVisible ? "entries" : "";
    history.replaceState(null, "", url);
    setView(entriesVisible);
  });
  addEventListener("hashchange", () => setView(entriesRequested()));
  setView(entriesRequested());
  loadInlineCv();
}

init();
