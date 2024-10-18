function AboutPage() {
    const container = document.createElement('div');
    container.classList.add('min-h-screen', 'p-6', 'text-center', 'bg-blue-100', 'dark:bg-blue-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
  
    const title = document.createElement('h1');
    title.textContent = 'DWA Starter Vanilla';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-blue-800', 'dark:text-blue-200');
  
    const para1 = document.createElement('p');
    para1.textContent = "Decentralized Web App: it's a Web5 Progressive Web App.";
    para1.classList.add('text-lg', 'text-blue-700', 'dark:text-blue-300');
  
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Why PWA?';
    subtitle.classList.add('text-2xl', 'font-semibold', 'mt-4', 'text-blue-800', 'dark:text-blue-200');
  
    const para2 = document.createElement('p');
    para2.textContent = 'It\'s a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.';
    para2.classList.add('text-lg', 'text-blue-700', 'dark:text-blue-300');
  
    container.appendChild(title);
    container.appendChild(para1);
    container.appendChild(subtitle);
    container.appendChild(para2);
  
    return container;
  }
  
  export function Home() {
    const homeContainer = document.createElement('div');
    homeContainer.classList.add('min-h-screen', 'p-6', 'bg-green-100', 'dark:bg-green-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    homeContainer.setAttribute('role', 'main'); // ARIA role for the main content
    homeContainer.setAttribute('aria-label', 'Home Page'); // ARIA label for the Home page

    // Title with ARIA attributes
    const title = document.createElement('h1');
    title.textContent = 'Home';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-green-800', 'dark:text-green-200');
    title.setAttribute('aria-label', 'Home Title'); // ARIA label for the title
    homeContainer.appendChild(title);

    // Navigation Section (only one)
    const nav = document.createElement('nav');
    nav.setAttribute('role', 'navigation'); // ARIA role for navigation
    nav.setAttribute('aria-label', 'Main Navigation'); // ARIA label for navigation

    const homeLink = document.createElement('a');
    homeLink.textContent = 'Home';
    homeLink.href = '#';
    homeLink.setAttribute('aria-label', 'Go to Home Page'); // ARIA label for the Home link

    const aboutLink = document.createElement('a');
    aboutLink.textContent = 'About';
    aboutLink.href = '#about';
    aboutLink.setAttribute('aria-label', 'Go to About Page'); // ARIA label for the About link

    const settingsLink = document.createElement('a');
    settingsLink.textContent = 'Settings';
    settingsLink.href = '#settings';
    settingsLink.setAttribute('aria-label', 'Go to Settings Page'); // ARIA label for the Settings link

    nav.appendChild(homeLink);
    nav.appendChild(aboutLink);
    nav.appendChild(settingsLink);
    homeContainer.appendChild(nav);

    // Image with proper alt text
    const image = document.createElement('img');
    image.src = 'vite.svg';
    image.alt = 'A descriptive alt text for the image'; // Important alt attribute for images
    homeContainer.appendChild(image);

    // Button with ARIA label and ID for the test case
    const button = document.createElement('button');
    button.id = 'theme-toggle';  // Assign an ID for test purposes
    button.textContent = 'Click Me';
    button.setAttribute('aria-label', 'Click this button to perform an action'); // ARIA label for the button
    homeContainer.appendChild(button);

    // Footer Section with role
    const footer = document.createElement('footer');
    footer.setAttribute('role', 'contentinfo'); // ARIA role for footer
    footer.setAttribute('aria-label', 'Footer Information'); // ARIA label for footer

    const footerText = document.createElement('p');
    footerText.textContent = 'This is the footer section of the home page';
    footerText.setAttribute('aria-label', 'Footer text'); // ARIA label for footer text
    footer.appendChild(footerText);
    homeContainer.appendChild(footer);

    // Appending the container to the root app element
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(homeContainer);
}

  
  export function About() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const aboutPage = AboutPage();
    app.appendChild(aboutPage);
  }
  
  export function Settings() {
    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('min-h-screen', 'p-6', 'bg-purple-100', 'dark:bg-purple-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    
    const title = document.createElement('h1');
    title.textContent = 'Settings';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-purple-800', 'dark:text-purple-200');
    
    settingsContainer.appendChild(title);
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(settingsContainer);
  }
  
  export function NotFound() {
    const notFoundContainer = document.createElement('div');
    notFoundContainer.classList.add('min-h-screen', 'p-6', 'bg-red-100', 'dark:bg-red-900', 'text-gray-900', 'dark:text-white', 'transition-colors', 'duration-300');
    
    const title = document.createElement('h1');
    title.textContent = '404 - Page Not Found';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-red-800', 'dark:text-red-200');
    
    notFoundContainer.appendChild(title);
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(notFoundContainer);
  }