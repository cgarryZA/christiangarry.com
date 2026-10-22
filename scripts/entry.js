import {
  findPublicEntry,
  loadPublicCv,
  readEntryQuery,
  renderEntryMarkdown,
} from "./cv-data.js";

function showUnavailable(failed = false) {
  document.getElementById("entry-content").hidden = true;
  const status = document.getElementById("entry-status");
  status.hidden = false;
  status.replaceChildren();
  const title = document.createElement("h1");
  title.className = "entry-title";
  title.textContent = failed ? "Entry could not be loaded" : "Entry unavailable";
  const message = document.createElement("p");
  message.textContent = failed
    ? "Please try again, or browse the CV entries."
    : "This entry is not available. You can browse the current CV entries using the link above.";
  status.append(title, message);
  if (failed) {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "cv-toggle";
    retry.textContent = "Try again";
    retry.addEventListener("click", loadEntry);
    status.append(retry);
  }
  document.title = `${title.textContent} — Christian Garry`;
}

function updateMetadata(entry) {
  const title = `${entry.title} — Christian Garry`;
  const url = `https://christiangarry.com/entry.html?id=${encodeURIComponent(entry.id)}`;
  const image = entry.cover
    ? new URL(new URL(entry.cover).pathname, "https://christiangarry.com").href
    : "https://christiangarry.com/assets/christian-garry-profile.jpg";
  document.title = title;
  document.querySelector('meta[name="description"]').content = entry.summary;
  document.getElementById("canonical-url").href = url;
  for (const [id, content] of Object.entries({
    "og-url": url, "twitter-url": url,
    "og-title": title, "twitter-title": title,
    "og-description": entry.summary, "twitter-description": entry.summary,
    "og-image": image, "twitter-image": image,
  })) document.getElementById(id).content = content;
}

function renderEntry(entry, entries) {
  document.getElementById("title").textContent = entry.title;
  document.getElementById("period").textContent = [entry.period || entry.date, entry.section].filter(Boolean).join(" · ");
  const cover = document.getElementById("cover");
  cover.replaceChildren();
  cover.hidden = !entry.cover;
  if (entry.cover) {
    const image = document.createElement("img");
    image.src = entry.cover;
    image.alt = "";
    image.width = 120;
    image.height = 120;
    image.addEventListener("error", () => { cover.hidden = true; }, { once: true });
    cover.append(image);
  }
  const links = document.getElementById("extlinks");
  links.replaceChildren(...entry.links.map(({ label, url }) => {
    const link = document.createElement("a");
    link.className = "badge";
    link.href = url;
    link.textContent = label;
    if (url.startsWith("https:")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }));
  links.hidden = !entry.links.length;
  for (const section of ["head", "body"]) {
    const target = document.getElementById(section);
    target.innerHTML = renderEntryMarkdown(entry[section], entry, entries);
    target.hidden = !entry[section];
  }
  document.getElementById("entry-status").hidden = true;
  document.getElementById("entry-content").hidden = false;
  updateMetadata(entry);
}

async function loadEntry() {
  const main = document.getElementById("main-content");
  const status = document.getElementById("entry-status");
  const query = readEntryQuery(location.search);
  if (!query) {
    showUnavailable();
    return;
  }
  main.setAttribute("aria-busy", "true");
  status.hidden = false;
  status.textContent = "Loading entry…";
  try {
    const { entries } = await loadPublicCv();
    const entry = findPublicEntry(entries, query);
    if (entry) renderEntry(entry, entries);
    else showUnavailable();
  } catch {
    showUnavailable(true);
  } finally {
    main.setAttribute("aria-busy", "false");
  }
}

loadEntry();
