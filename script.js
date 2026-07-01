const tabs = Array.from(document.querySelectorAll("[role='tab'][data-tab]"));
const panels = Array.from(document.querySelectorAll("[role='tabpanel'][data-panel]"));
const tabLinks = Array.from(document.querySelectorAll("[data-tab-link]"));
const knownTabs = new Set(tabs.map((tab) => tab.dataset.tab));

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
  return knownTabs.has(hash) ? hash : "overview";
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

window.addEventListener("hashchange", () => {
  activateTab(tabFromHash(), { updateHash: false });
});

activateTab(tabFromHash(), { updateHash: false });
