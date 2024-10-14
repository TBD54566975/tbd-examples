// Function to check system preference and localStorage for theme preference
function applyTheme() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentTheme = localStorage.getItem("theme") || (prefersDarkScheme ? "dark" : "light");

    // Toggle dark mode based on the stored or system preference
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
}

// Function to add the theme toggle functionality to the page
function addThemeToggleToPage() {
    const toggleButton = document.querySelector("#theme-toggle");

    // Listen for the toggle button click
    toggleButton.addEventListener("click", () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const newTheme = isDarkMode ? 'light' : 'dark';

        // Toggle the theme and save to localStorage
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem("theme", newTheme);
    });
}

// Apply the theme on page load
window.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    addThemeToggleToPage();
});

// Router logic
const routes = {
    '/': () => `<h1>Home</h1>`,
    '/about': () => `<h1>DWA Starter Vanilla</h1>`,
    '/settings': () => `<h1>Settings</h1>`,
    '*': () => `<h1>404 - Page Not Found</h1>`,
};

function handleRoute() {
    const path = window.location.pathname;
    const route = routes[path] || routes['*'];
    document.getElementById('app').innerHTML = route();
}

// Handle back/forward navigation
window.addEventListener('popstate', handleRoute);

// Initial page load
handleRoute();
