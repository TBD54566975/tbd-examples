// Create the theme toggle button
function ThemeToggleButton() {
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.textContent = 'Toggle Theme';
    button.classList.add('p-2', 'rounded', 'border', 'bg-gray-200', 'dark:bg-gray-700');
  
    // Add click event to toggle dark mode
    button.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDarkMode = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  
    return button;
  }
  
  // Append the theme toggle button to the page
  function addThemeToggleToPage() {
    const toggleButton = ThemeToggleButton();
    document.body.prepend(toggleButton); // Add the toggle button to the body
  }
  
  // Create About page
  function AboutPage() {
    const container = document.createElement('div');
    container.classList.add('space-y-4', 'p-6', 'text-center');
    
    const title = document.createElement('h1');
    title.textContent = 'DWA Starter Vanilla';
    title.classList.add('text-3xl', 'font-bold', 'mb-4');
    
    const para1 = document.createElement('p');
    para1.textContent = "Decentralized Web App: it's a Web5 Progressive Web App.";
    para1.classList.add('text-lg');
    
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Why PWA?';
    subtitle.classList.add('text-2xl', 'font-semibold', 'mt-4');
    
    const para2 = document.createElement('p');
    para2.textContent = 'It\'s a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.';
    para2.classList.add('text-lg');
    
    container.appendChild(title);
    container.appendChild(para1);
    container.appendChild(subtitle);
    container.appendChild(para2);
    
    return container;
  }
  
  export function Home() {
    document.getElementById('app').innerHTML = `<h1>Home</h1>`;
  }
  
  export function About() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const aboutPage = AboutPage();
    app.appendChild(aboutPage);
  }
  
  export function Settings() {
    document.getElementById('app').innerHTML = `<h1>Settings</h1>`;
  }
  
  export function NotFound() {
    document.getElementById('app').innerHTML = `<h1>404 - Page Not Found</h1>`;
  }
  