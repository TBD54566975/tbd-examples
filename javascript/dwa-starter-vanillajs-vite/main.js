// main.js

import { Home, About, Settings, NotFound } from "./components.js";

// Define routes and their corresponding components
const routes = {
  "/": Home,
  "/about": About,
  "/settings": Settings,
};

// Function to handle navigation
function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

// Router function to render components based on the current URL
function router() {
  const path = window.location.pathname;
  const route = routes[path] || NotFound;
  route();
}

// Event delegation for link clicks
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(e.target.href);
  }
});

// Listen to popstate event (back/forward navigation)
window.addEventListener("popstate", router);

// Initial call to router to render the correct component on page load
document.addEventListener("DOMContentLoaded", router);

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
