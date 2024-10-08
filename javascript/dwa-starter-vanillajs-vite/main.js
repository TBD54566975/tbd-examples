// main.js

import { Home, About, Settings, NotFound } from './components.js';

// Define routes and their corresponding components
const routes = {
    '/': Home,
    '/about': About,
    '/settings': Settings,
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
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        navigateTo(e.target.href);
    }
});

// Listen to popstate event (back/forward navigation)
window.addEventListener('popstate', router);

// Initial call to router to render the correct component on page load
document.addEventListener('DOMContentLoaded', router);
