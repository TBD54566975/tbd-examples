# Vue.js Decentralized Web App (DWA) Starter

Decentralized Web App: it's a Web5 Progressive Web App.

## Why PWA?

It's a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.

Aside from that, the advanced PWA capabilities such as modifying fetch requests allow us to extract the most such as displaying images with DRLs in the traditional `src` attribute.

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 16.x or higher recommended)
- [pnpm](https://pnpm.io/) (preferred for fast package management)

```bash
npm install -g pnpm
```

## 🛠️ Project Setup

### Step 1: Clone the Repository

First, clone the repository to your local machine.

```bash
git clone https://github.com/your-username/dwa-starter-vue.git
```

```bash
cd dwa-starter-vue
```

### Step 2: Install Dependencies

Install the required packages with pnpm.

```bash
pnpm install
```

### Step 3: Run the Development Server

Start the development server and hot-reload the project.

```bash
pnpm dev
```

Alternatively, you can run the development server with:

```bash
pnpm run start
```

### Step 4: Build for Production

To compile and minify the project for production, run:

```bash
pnpm build
```

### Step 5: Run Unit and End-to-End Tests

#### Unit Tests with Vitest

Run the unit tests using Vitest.

```bash
pnpm test:unit
```

#### End-to-End Tests with Playwright

Ensure Playwright is installed, then run your end-to-end tests.

```bash
npx playwright install
```

```bash
pnpm test:e2e
```

You can also run tests specific to a browser or test file:

```bash
pnpm test:e2e --project=chromium
```

```bash
pnpm test:e2e tests/example.spec.ts
```

### Step 6: Linting

Run the linter to catch and fix common issues:

```bash
pnpm lint
```

## 📂 Project Structure

Here’s an overview of the key directories and files in this project:

- `src/` : Contains the Vue components, pages, and logic for the DWA.
- `public/` : Static assets like images and the `index.html` file.
- `tests/` : Includes unit and end-to-end test files.
- `vite.config.ts` : Configuration for Vite, optimized for fast builds.
- `package.json` : Lists dependencies and scripts for managing the project.

## 👥 Contributing

We welcome contributions to this project! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and submit a pull request.
4. Respond to any feedback from the review process.

Please ensure your code follows the established guidelines and is well-documented. Refer to our [contributing guide](CONTRIBUTING.md) for more details.

## 🔧 Troubleshooting Common Issues

1. **Dependencies not installing**: Ensure you're using the correct version of Node.js and have installed pnpm globally.
2. **Port conflicts**: If the dev server cannot start, check that the default port 3000 is available, or modify it in the `vite.config.ts` file.
3. **TypeScript errors**: Ensure you have Volar installed in VSCode for proper TypeScript support.

## 📚 Useful Links

- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Documentation](https://vitejs.dev/)
- [Web5 JS SDK Documentation](https://web5.com/sdk)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub README Guide](https://github.com)

## 🎉 Getting Started

Want to contribute or get involved? Start by forking the repository, and follow the setup instructions above to get the project running on your local machine. Feel free to reach out if you encounter any issues!

For more information or questions, join our [Discord Community](https://discord.gg/tbd).
