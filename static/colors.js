const localStorageKey = "color-scheme";
const dark = "dark";
const light = "light";

const html = document.documentElement;

const darkButton = document.querySelector("[data-set-theme-dark]");
const lightButton = document.querySelector("[data-set-theme-light]");

function darkMode() {
  html.dataset.theme = dark;
  darkButton.toggleAttribute("hidden", true);
  lightButton.toggleAttribute("hidden", false);
}

function lightMode() {
  html.dataset.theme = light;
  darkButton.toggleAttribute("hidden", false);
  lightButton.toggleAttribute("hidden", true);
}

darkButton.addEventListener("click", () => {
  darkMode();
  localStorage.setItem(localStorageKey, dark);
});

lightButton.addEventListener("click", () => {
  lightMode();
  localStorage.setItem(localStorageKey, light);
});

const storedValue = localStorage.getItem(localStorageKey);
if (storedValue) {
  // If we have a value in localStorage for the client already, use their choice.
  storedValue === light ? lightMode() : darkMode();
} else {
  // Otherwise, if they have a color-scheme preference, use it.
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  darkModeMediaQuery.matches ? darkMode() : lightMode();

  darkModeMediaQuery.addListener(e => {
    e.matches ? darkMode() : lightMode();
  });
}
