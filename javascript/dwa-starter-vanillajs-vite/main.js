// Function to create and render the toggle button
function createThemeToggleButton() {
  console.log("Creating theme toggle button");
  const nav = document.querySelector("nav");
  const button = document.createElement("button");
  button.id = "theme-toggle";
  button.textContent = "Toggle Theme";
  button.setAttribute("aria-label", "Toggle Dark Mode");
  button.classList.add("theme-toggle-btn");
  nav.appendChild(button);
  button.addEventListener("click", toggleTheme);
  console.log("Theme toggle button created and added to nav");
}

function toggleTheme() {
  console.log("Toggle theme function called");
  const body = document.body;
  const isDarkMode = body.classList.contains("dark-mode");
  console.log("Current mode is dark:", isDarkMode);

  if (isDarkMode) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    console.log("Switched to light mode:", body.classList); // Log class list
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    console.log("Switched to dark mode:", body.classList); // Log class list
  }
  localStorage.setItem("theme", isDarkMode ? "light" : "dark");
}

// Apply stored theme preference or system preference on load
function applyStoredTheme() {
  console.log("Applying stored theme");
  const storedTheme = localStorage.getItem("theme");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const body = document.body;

  console.log("Stored theme:", storedTheme);
  console.log("System prefers dark scheme:", prefersDarkScheme.matches);

  if (
    storedTheme === "dark" ||
    (storedTheme === null && prefersDarkScheme.matches)
  ) {
    body.classList.add("dark-mode");
    console.log("Applied dark mode");
  } else {
    body.classList.add("light-mode");
    console.log("Applied light mode");
  }
}

// Initial setup on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded");
  applyStoredTheme(); // Apply the stored theme or system preference
  createThemeToggleButton(); // Create the theme toggle button and attach to nav
  // Initial routing setup (if using navigation in your app)
  router();
  console.log("Initial setup completed");
});

// Import your components for routing (if necessary)
import { Home, About, Settings, NotFound } from "./components.js";

// Define routes and their corresponding components (if necessary)
const routes = {
  "/": Home,
  "/about": About,
  "/settings": Settings,
};

// Function to handle navigation (if necessary)
function navigateTo(url) {
  console.log("Navigating to:", url);
  history.pushState(null, null, url);
  router();
}

// Router function to render components based on the current URL
function router() {
  console.log("Router function called");
  const path = window.location.pathname;
  console.log("Current path:", path);
  const route = routes[path] || NotFound;
  route();
}

// Event delegation for link clicks (if necessary)
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    console.log("Link clicked:", e.target.href);
    e.preventDefault();
    navigateTo(e.target.href);
  }
});

// Listen to popstate event (back/forward navigation) (if necessary)
window.addEventListener("popstate", router);

console.log("Script loaded");

// Service worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => {
        console.log("Service Worker: Registered");

        // Check if a new SW is waiting to activate
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Notify user about new version availability
              if (
                confirm(
                  "A new version of the app is available. Would you like to update?"
                )
              ) {
                newWorker.postMessage({ action: "skipWaiting" });
              }
            }
          };
        };
      })
      .catch((err) => console.log(`Service Worker Error: ${err}`));

    // Listen for `controllerchange` to reload the page when the new SW takes control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install button or UI (ensure an element with id="install-button" exists in your HTML)
  const addToHomeScreen = document.querySelector("#install-button");
  addToHomeScreen.style.display = "block";

  addToHomeScreen.addEventListener("click", () => {
    // Show the install prompt
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      deferredPrompt = null;
    });
  });
});
