const html = document.documentElement;
const darkButton = document.querySelector("[data-set-theme-dark]");
const lightButton = document.querySelector("[data-set-theme-light]");

const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

if (darkModeMediaQuery.matches) {
  lightButton.classList.toggle("dn", false);
} else {
  darkButton.classList.toggle("dn", false);
}

darkModeMediaQuery.addListener(e => {
  const darkModeOn = e.matches;
  if (darkModeOn) {
    html.dataset.theme = "dark";
    darkButton.classList.toggle("dn", true);
    lightButton.classList.toggle("dn", false);
  } else {
    html.dataset.theme = "light";
    darkButton.classList.toggle("dn", false);
    lightButton.classList.toggle("dn", true);
  }
});

darkButton.addEventListener("click", () => {
  html.dataset.theme = "dark";

  darkButton.classList.toggle("dn", true);
  lightButton.classList.toggle("dn", false);
});

lightButton.addEventListener("click", () => {
  html.dataset.theme = "light";

  darkButton.classList.toggle("dn", false);
  lightButton.classList.toggle("dn", true);
});
