const screenData = {
  "life-overview": {
    image: "assets/screens/life-overview.webp",
    alt: "Lifaria Life Book overview screen",
    eyebrow: "Life workspace",
    title: "The Shape of a Life",
    description:
      "A working Life Book assembled from uploads, remembered moments, suggested eras, and chapter drafts."
  },
  "choose-sources": {
    image: "assets/screens/choose-sources.webp",
    alt: "Lifaria source picker screen",
    eyebrow: "Source intake",
    title: "Choose what Lifaria can use",
    description:
      "Start with selected uploads and notes. Larger account connections can come later."
  },
  "moments-list": {
    image: "assets/screens/moments-list.webp",
    alt: "Lifaria meaningful moments review screen",
    eyebrow: "AI event detection",
    title: "Meaningful moments",
    description:
      "Review memories Lifaria found before opening their evidence, meaning, and era placement details."
  },
  "moment-detail": {
    image: "assets/screens/moment-detail.webp",
    alt: "Lifaria moment evidence screen",
    eyebrow: "Evidence review",
    title: "Why Lifaria found it",
    description:
      "Each proposed memory stays tied to source clusters, narrative clues, and theme tags before it becomes part of the book."
  },
  "chapter-board": {
    image: "assets/screens/chapter-board.webp",
    alt: "Lifaria chapter board screen",
    eyebrow: "Chapter builder",
    title: "Editable chapters",
    description:
      "Approved moments become a draft structure you can rename, reorder, rewrite, and export."
  }
};

const tabs = document.querySelectorAll(".screen-tab");
const screenImage = document.querySelector("#screen-image");
const screenEyebrow = document.querySelector("#screen-eyebrow");
const screenTitle = document.querySelector("#screen-title");
const screenDescription = document.querySelector("#screen-description");

function selectScreen(screenKey) {
  const next = screenData[screenKey];
  if (!next) return;

  screenImage.src = next.image;
  screenImage.alt = next.alt;
  screenEyebrow.textContent = next.eyebrow;
  screenTitle.textContent = next.title;
  screenDescription.textContent = next.description;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.screen === screenKey;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectScreen(tab.dataset.screen));
});
