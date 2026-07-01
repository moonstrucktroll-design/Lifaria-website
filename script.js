const tabs = Array.from(document.querySelectorAll("[role='tab'][data-tab]"));
const panels = Array.from(document.querySelectorAll("[role='tabpanel'][data-panel]"));
const tabLinks = Array.from(document.querySelectorAll("[data-tab-link]"));
const knownTabs = new Set(tabs.map((tab) => tab.dataset.tab));
const haikuArchive = document.querySelector("#haiku-archive");
const haikuFilter = document.querySelector("#haiku-filter");
const haikuCount = document.querySelector("#haiku-count");
let haikuEntries = [];

function activateTab(tabId, options = {}) {
  if (!knownTabs.has(tabId)) return;

  tabs.forEach((tab) => {
    const isSelected = tab.dataset.tab === tabId;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tabId;
  });

  if (options.updateHash !== false) {
    history.replaceState(null, "", `#${tabId}`);
  }

  if (options.focusPanel) {
    document.querySelector(`[data-panel="${tabId}"]`)?.focus({ preventScroll: true });
  }
}

function tabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return knownTabs.has(hash) ? hash : "home";
}

function parseHaikuYear(text) {
  const monthHeading = /^(July|August|September|October|November|December|January|February|March|April|May|June)\s+\d/i;
  const blocks = [];
  let current = [];

  text.replace(/\r/g, "").split("\n").forEach((line) => {
    if (monthHeading.test(line) && current.length) {
      blocks.push(current);
      current = [line];
      return;
    }

    current.push(line);
  });

  if (current.length) blocks.push(current);

  return blocks
    .map((lines, index) => {
      const heading = lines.shift()?.trim() || `Week ${index + 1}`;
      const body = lines.join("\n").trim();
      const title = body.split("\n").find((line) => line.trim() && !/[А-Яа-я]/.test(line))?.trim() || "Weekly haiku";
      return { heading, title, body };
    });
}

function renderHaiku(entries) {
  if (!haikuArchive || !haikuCount) return;

  haikuArchive.innerHTML = "";
  const query = haikuFilter?.value.trim().toLowerCase() || "";
  const filtered = entries.filter((entry) => {
    const text = `${entry.heading} ${entry.title} ${entry.body}`.toLowerCase();
    return text.includes(query);
  });

  haikuCount.textContent = `${filtered.length} of ${entries.length} weekly haiku`;

  filtered.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "haiku-card";
    const heading = document.createElement("span");
    const title = document.createElement("h3");
    const body = document.createElement("pre");

    heading.textContent = entry.heading;
    title.textContent = entry.title;
    body.textContent = entry.body;
    article.append(heading, title, body);
    haikuArchive.append(article);
  });
}

async function loadHaikuYear() {
  if (!haikuArchive) return;

  try {
    const response = await fetch("assets/haiku-year.txt");
    if (!response.ok) throw new Error("Haiku archive unavailable");
    const text = await response.text();
    haikuEntries = parseHaikuYear(text);
    renderHaiku(haikuEntries);
  } catch {
    haikuCount.textContent = "Haiku archive could not load.";
    haikuArchive.innerHTML = `
      <article class="haiku-card">
        <span>June 26th - 52nd</span>
        <h3>Lucky</h3>
        <pre>Fortune finds the door!
Luck pours in and stays for good.
River finds the sea!</pre>
      </article>
    `;
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));

  tab.addEventListener("keydown", (event) => {
    const currentIndex = tabs.indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex].dataset.tab);
  });

  tab.tabIndex = index === 0 ? 0 : -1;
});

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const tabId = link.dataset.tabLink;
    if (!knownTabs.has(tabId)) return;

    event.preventDefault();
    activateTab(tabId);
    document.querySelector(".workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

haikuFilter?.addEventListener("input", () => renderHaiku(haikuEntries));

window.addEventListener("hashchange", () => {
  activateTab(tabFromHash(), { updateHash: false });
});

activateTab(tabFromHash(), { updateHash: false });
loadHaikuYear();
