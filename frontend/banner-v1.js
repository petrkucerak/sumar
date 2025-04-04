function renderBanner() {
  const bannerEl = document.getElementById("banner");
  const BANNER_VERSION = "banner_2025-04-04";

  // add closing action
  const bannerXEl = document
    .getElementById("banner__x")
    .addEventListener("click", () => {
      bannerEl.classList.add("hidden");
      localStorage.setItem(BANNER_VERSION, BANNER_VERSION);
    });

  // render only if use didn't hide message
  if (
    localStorage.getItem(BANNER_VERSION) === null &&
    localStorage.getItem(BANNER_VERSION) !== BANNER_VERSION
  ) {
    bannerEl.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => renderBanner());
