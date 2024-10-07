
# Vanilla.js DWA Starter

Decentralized Web App (DWA): A Web5 Progressive Web App (PWA) built using Vanilla.js.

## Why PWA?

A PWA can work offline, making it a perfect match with Web5 Decentralized Web Nodes (DWNs), which support local storage sync. PWAs also offer advanced capabilities, such as modifying fetch requests, enabling the use of Decentralized Resource Locators (DRLs) for image loading and other functions.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.x (Use `nvm use 20` if using Node Version Manager)
- **npm** or **pnpm** (We recommend pnpm for dependency management)
- **Docker** (for running a local DWN server)

## Installation

Follow these steps to set up the project:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/vanilla-dwa-starter.git
   cd vanilla-dwa-starter
   ```

2. **Install dependencies**:

   Using pnpm (recommended):

   ```bash
   pnpm install
   ```

   Alternatively, using npm:

   ```bash
   npm install
   ```

## Running the Project

### Development Mode

To run the project locally in development mode:

1. **Start the local DWN server** :

   ```bash
   pnpm install
   ```

2. **Start the development server**:

   Using pnpm:

   ```bash
   pnpm dev
   ```

   Alternatively, using npm:

   ```bash
   npm run dev
   ```

This will start a local development server, typically at `http://localhost:3000`.

### Building for Production

To build the app for production:

1. Run the build command:

   Using pnpm:

   ```bash
   pnpm build
   ```

   Alternatively, using npm:

   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your web server. The output is a static site with all the production settings optimized for a Decentralized Web App.

### Running Tests

This project uses Playwright for end-to-end (E2E) testing and Vitest for unit testing.

- **End-to-End (E2E) Tests** are managed by Playwright and are located in a dedicated `tests/` folder.

#### Running All Tests

To run both unit and E2E tests, execute:

```bash
pnpm test
```

Or, if using npm:

```bash
npm run test
```

#### Running Unit Tests Only

To run only the unit tests:

```bash
pnpm test:unit
```

Or, if using npm:

```bash
npm run test:unit
```

#### Running E2E Tests Only

To run only the end-to-end tests:

```bash
pnpm test:e2e
```

Or, if using npm:

```bash
npm run test:e2e
```

## Project Structure

Here’s a brief overview of the project's file structure:

- **`public/`**: Contains public assets that will be served by the web server.
  - `vite.svg`: Logo or image file related to Vite.
  
- **`tests/`**: Contains the test files for the application.
  - `main.spec.js`: Main test file for running unit or E2E tests.

- **`.gitignore`**: Specifies files and directories that should be ignored by Git.

- **`.tbd-example.json`**: An example configuration file for TBD or related settings.

- **`index.html`**: The main HTML file for the application.

- **`main.js`**: The main JavaScript file where the application logic begins.

- **`package.json`**: Contains project metadata, scripts, and dependencies.

- **`playwright.config.js`**: Configuration file for Playwright E2E testing.

- **`pnpm-lock.yaml`**: Lockfile for pnpm to ensure consistent dependency versions.

- **`readme.md`**: The README file for the project (this file).

- **`style.css`**: Contains the CSS styles for the application.

- **`vite.config.js`**: Configuration file for Vite, the build tool and development server.

## Contributing

We welcome contributions from the community! Follow these steps to contribute:

1. **Fork the repository**.
2. **Create a new branch** for your feature or bug fix:

   ```bash
   git checkout -b feature-name
   ```

3. **Commit your changes**:

   ```bash
   git commit -m "Add feature description"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature-name
   ```

5. **Submit a pull request** with a clear description of your changes.

For detailed guidelines, please refer to the `CONTRIBUTING.md` file.

## Troubleshooting

Here are some common issues and how to resolve them:

- **Node.js version mismatch**: Ensure you are using Node.js v20.x. You can switch to the correct version using `nvm` (`nvm use 20`).
- **Dependencies not installing**: Ensure you are using the correct package manager (preferably pnpm). Try deleting `node_modules` and reinstalling dependencies:

  ```bash
  rm -rf node_modules
  pnpm install
  ```

## Documentation

- [Vanilla.js Documentation](https://vanilla-js.com/)
- [Web5 JS SDK Documentation](https://developer.tbd.website/docs/web5)

