// components.js
function AboutPage() {
    // Create the main container
    const container = document.createElement('div');
    container.classList.add('space-y-4', 'p-6', 'text-center');
  
    // Create the main title
    const title = document.createElement('h1');
    title.textContent = 'DWA Starter Vanilla';
    title.classList.add('text-3xl', 'font-bold', 'mb-4');
  
    // Create the first paragraph
    const para1 = document.createElement('p');
    para1.textContent = "Decentralized Web App: it's a Web5 Progressive Web App.";
    para1.classList.add('text-lg');
  
    // Create the subtitle
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Why PWA?';
    subtitle.classList.add('text-2xl', 'font-semibold', 'mt-4');
  
    // Create the second paragraph
    const para2 = document.createElement('p');
    para2.textContent = 'It\'s a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.';
    para2.classList.add('text-lg');
  
    // Append elements to the container
    container.appendChild(title);
    container.appendChild(para1);
    container.appendChild(subtitle);
    container.appendChild(para2);
  
    // Return the container element
    return container;
  }
  
export function Home() {
    document.getElementById('app').innerHTML = `<h1>Home</h1>`;
}

export function About() {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear the current content

    // Create and append the About page
    const aboutPage = AboutPage(); // Call the AboutPage function to get the component
    app.appendChild(aboutPage);
}

export function Settings() {
    document.getElementById('app').innerHTML = `<h1>Settings</h1>`;
}

export function NotFound() {
    document.getElementById('app').innerHTML = `<h1>404 - Page Not Found</h1>`;
}

