/**
 * Workshop dashboard — reads /data/apps.json and renders cards.
 * Detects environment (localhost vs deployed) and picks the right URL per card.
 * Probes each app for liveness so unreachable services are visibly dimmed.
 */

(async function () {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.");

  const env = isLocal ? "local" : "production";
  const envIndicator = document.getElementById("env-indicator");
  envIndicator.textContent = isLocal ? "local dev" : "production";
  envIndicator.dataset.env = env;

  const grid = document.getElementById("app-grid");
  if (!grid) return;

  let registry;
  try {
    const resp = await fetch("data/apps.json", { cache: "no-cache" });
    registry = await resp.json();
  } catch (e) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);">
      Couldn't load <code>data/apps.json</code>. Check the platform setup.</p>`;
    return;
  }

  const ICON_PATHS = {
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    "trending-up": "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    "graduation-cap": "M22 10v6 M2 10l10-5 10 5-10 5z M6 12v5c0 2 4 3 6 3s6-1 6-3v-5",
    globe: "M12 2a10 10 0 100 20 10 10 0 000-20z M2 12h20 M12 2a15 15 0 010 20 M12 2a15 15 0 000 20",
    layers: "M12 2l-10 6 10 6 10-6-10-6z M2 14l10 6 10-6 M2 18l10 6 10-6",
    car: "M5 17h14 M3 12l2-5a2 2 0 012-2h10a2 2 0 012 2l2 5v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z M7 17v0 M17 17v0",
  };

  function iconSVG(name) {
    const path = ICON_PATHS[name] || ICON_PATHS.globe;
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}"></path>
    </svg>`;
  }

  function urlFor(app) {
    return isLocal ? app.dev_url : app.prod_url;
  }

  // Render shells first, then probe.
  const cards = registry.apps.map((app) => {
    const url = urlFor(app);
    const card = document.createElement("a");
    card.className = "app-card";
    card.href = url;
    card.target = app.id === "workshop" ? "_self" : "_blank";
    card.rel = "noopener";
    card.dataset.status = "checking";
    card.style.setProperty("--card-accent", app.color || "var(--accent)");

    card.innerHTML = `
      <div class="app-card-head">
        <div style="display:flex;align-items:center;gap:10px;color:${app.color || "var(--accent)"};">
          ${iconSVG(app.icon)}
          <h2 class="app-card-title">${app.name}</h2>
        </div>
        <span class="app-card-kind">${app.kind}</span>
      </div>
      <p class="app-card-desc">${app.description}</p>
      <div class="app-card-foot">
        <span class="app-card-status" data-status="checking">checking…</span>
        <span class="app-card-link">${isLocal ? `:${app.dev_port}` : new URL(url).hostname}</span>
      </div>
    `;

    grid.appendChild(card);
    return { card, app, url };
  });

  // Liveness probes — best-effort, just to dim cards that are offline.
  // We use no-cors so we don't fail on CORS for backends. A status of
  // "opaque" still tells us the port answered.
  await Promise.all(
    cards.map(async ({ card, app, url }) => {
      try {
        const probe = isLocal && app.api ? app.api.dev_url + "/healthz" : url;
        await fetch(probe, { mode: "no-cors", cache: "no-store" });
        card.dataset.status = "online";
        card.querySelector(".app-card-status").dataset.status = "online";
        card.querySelector(".app-card-status").textContent = "online";
      } catch (_) {
        card.dataset.status = "unreachable";
        const s = card.querySelector(".app-card-status");
        s.dataset.status = "unreachable";
        s.textContent = "offline";
      }
    }),
  );
})();
