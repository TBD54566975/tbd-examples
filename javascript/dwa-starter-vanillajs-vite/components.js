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
    
    const title = document.createElement('h1');
    title.textContent = 'Home';
    title.classList.add('text-3xl', 'font-bold', 'mb-4', 'text-green-800', 'dark:text-green-200');
    
    homeContainer.appendChild(title);
    
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