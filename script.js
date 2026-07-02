const panels = Array.from(document.querySelectorAll("[data-panel]"));
const tabLinks = Array.from(document.querySelectorAll("[data-tab-link]"));
const sectionLinks = Array.from(
  document.querySelectorAll(".site-nav [data-tab-link], .brand-lockup[data-tab-link]"),
);
const knownTabs = new Set(panels.map((panel) => panel.dataset.panel));
const haikuArchive = document.querySelector("#haiku-archive");
const haikuFilter = document.querySelector("#haiku-filter");
const haikuCount = document.querySelector("#haiku-count");
const monthOrder = [
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
];
let haikuEntries = [];

function activateTab(tabId, options = {}) {
  if (!knownTabs.has(tabId)) return;

  sectionLinks.forEach((link) => {
    if (link.dataset.tabLink === tabId) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
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
  const headingPattern = /^(July|August|September|October|November|December|January|February|March|April|May|June)\s+\d/i;
  const blocks = [];
  let current = [];

  text.replace(/\r/g, "").split("\n").forEach((line) => {
    if (headingPattern.test(line) && current.length) {
      blocks.push(current);
      current = [line];
      return;
    }

    current.push(line);
  });

  if (current.length) blocks.push(current);

  return blocks.map((lines, index) => {
    const heading = lines.shift()?.trim() || `Week ${index + 1}`;
    const body = lines.join("\n").trim();
    const month = heading.match(/^[A-Za-z]+/)?.[0] || "Other";
    const title =
      body
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line && !/[А-Яа-я]/.test(line) && line.length <= 48) || "Weekly haiku";

    return { heading, month, title, body };
  });
}

function groupByMonth(entries) {
  return entries.reduce((groups, entry) => {
    if (!groups.has(entry.month)) groups.set(entry.month, []);
    groups.get(entry.month).push(entry);
    return groups;
  }, new Map());
}

function orderedMonths(groups) {
  return Array.from(groups.keys()).sort((a, b) => {
    const aIndex = monthOrder.indexOf(a);
    const bIndex = monthOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function createHaikuCard(entry) {
  const article = document.createElement("article");
  article.className = "haiku-card";

  const heading = document.createElement("span");
  const title = document.createElement("h4");
  const body = document.createElement("pre");

  heading.textContent = entry.heading;
  title.textContent = entry.title;
  body.textContent = entry.body;
  article.append(heading, title, body);

  return article;
}

function renderHaiku(entries) {
  if (!haikuArchive || !haikuCount) return;

  haikuArchive.innerHTML = "";
  const query = haikuFilter?.value.trim().toLowerCase() || "";
  const filtered = entries.filter((entry) => {
    const text = `${entry.heading} ${entry.title} ${entry.body}`.toLowerCase();
    return text.includes(query);
  });
  const groups = groupByMonth(filtered);
  const fragment = document.createDocumentFragment();

  haikuCount.textContent = `${filtered.length} of ${entries.length} weekly haiku`;

  orderedMonths(groups).forEach((month) => {
    const section = document.createElement("section");
    section.className = "haiku-month";

    const heading = document.createElement("h3");
    const grid = document.createElement("div");
    grid.className = "haiku-month-grid";

    heading.textContent = month;
    groups.get(month).forEach((entry) => grid.append(createHaikuCard(entry)));
    section.append(heading, grid);
    fragment.append(section);
  });

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No haiku match that search.";
    fragment.append(empty);
  }

  haikuArchive.append(fragment);
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
      <section class="haiku-month">
        <h3>June</h3>
        <div class="haiku-month-grid">
          <article class="haiku-card">
            <span>June 26th - 52nd</span>
            <h4>Lucky</h4>
            <pre>Fortune finds the door!
Luck pours in and stays for good.
River finds the sea!</pre>
          </article>
        </div>
      </section>
    `;
  }
}

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const tabId = link.dataset.tabLink;
    if (!knownTabs.has(tabId)) return;

    event.preventDefault();
    activateTab(tabId);

    const target = link.classList.contains("brand-lockup")
      ? document.querySelector("#main")
      : document.querySelector(`[data-panel="${tabId}"]`) || document.querySelector(".tab-section");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

haikuFilter?.addEventListener("input", () => renderHaiku(haikuEntries));

window.addEventListener("hashchange", () => {
  activateTab(tabFromHash(), { updateHash: false });
});

activateTab(tabFromHash(), { updateHash: false });
loadHaikuYear();
