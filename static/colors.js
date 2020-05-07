const html = document.documentElement;

const darkButton = document.querySelector("[data-set-theme-dark]");
const lightButton = document.querySelector("[data-set-theme-light]");

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
