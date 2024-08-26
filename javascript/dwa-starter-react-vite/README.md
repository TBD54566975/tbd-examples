# DWA Starter React

Decentralized Web App: it's a Web5 Progressive Web App.

## Why PWA?

It's a perfect match with Web5 DWNs since a PWA can work offline and DWN has a synced local storage.

Aside from that, the advanced PWA capabilities such as modifying fetch requests allow us to extract the most such as displaying images with DRLs in the traditional `src` attribute.

## Running Instructions

### Running Development Environment Locally

Requirements:

- node v20.x (`nvm use 20`)
- pnpm v9 (`npm i -g pnpm`)
- docker (to run a local DWN server)

```sh
pnpm i
docker compose up -d
pnpm dev
```

### Building App

```sh
pnpm build
```

Deploy the `dist` folder to the server. It's just a static PWA! Please make sure all the settings are optimized for production, including your application descriptions, icons, service workers, polyfills and configurations (ie. check vite-pwa eslint recommendations below).

## Application Structure

- It's just a **Traditional React Application** with a PWA on top using `vite-pwa`
  - `src/pages` - contains the page components
  - `src/App.tsx` - contains the main App component
  - `src/main.tsx` - contains the main entry point
  - `src/sw.ts` - contains the service worker setup, including the new web5 `activatePolyfills` which will setup DRLs (and DWN store offline management in the future)
- Built with tailwind css and @shadcn/ui which will allow us to expand to other frameworks as well (vue, svelte, solid, etc.)
  - `src/components/ui` has the shadcn default components
- `src/web5` folder has web5 specific functionalities that you will most likely not needed to updated on your DWA
  - except for `protocols.ts` which you should add your custom protocols and/or port other known protocols to leverage typings

## Application Functionalities

The app has a standard responsive layout with a sidebar, with basic routing setup with three pages:

- Home Page: it invites the user to connect to Web5 and once it's connect it presents a basic Todo List CRUD powered by DWNs
- Settings Page: shows off protocols and the usage of DRL in an `img` tag.
- About Page: it shows a basic info page that does not require any Web5 connection.

### Home Page Tasks List

Just a basic tasks CRUD that allows the user to add, edit, delete and mark task as done. Pretty standard example across many frameworks.

Try it yourself! Connect and then add your first tasks, edit, remove them etc.

The difference is that here we are using Web5 DWNs as the data store.

It uses Web5 through the `useWeb5` hook and, to simplify the component code, we wrapped the CRUD operations using the `repository` pattern, pretty much a data access layer, in the [`todo-dwn-repository.ts](./src/lib/todo-dwn-repository.ts) file.

### Settings Profile Page

In this page we are using direct access to the DWN protocols in the component itself, just to have more inline code to read.

The goal here is to understand how to persist data using protocols (read more in our [docs here](https://developer.tbd.website/docs/web5/learn/protocols)) and read them using DRLs in the browser natively.

First, we need to install the protocols schemas, the code for that can be found in the [`protocols.ts`](./src/web5/protocols.ts) file and is executed only once, when connected, if the protocol is not installed yet.

Then in this page, we read the display name and the image using DRLs, which is a browser customization in the fetch API to read protocols when the url is prefixed with `https://dweb`.

First the page will be blank and you will see 404 network errors. Thats because we tried to fetch from the DWN protocol without any data. Try to change the display name and upload an image in the form. Then refresh the page.

Now you will see that we load the display name and the avatar image from the following urls:

- `https://dweb/${did}/read/protocols/${encodeURIComponent(protocolUri)}/name`
- `https://dweb/${did}/read/protocols/${encodeURIComponent(protocolUri)}/avatar`

The beauty of DWAs is that, once the Web5 SDK polyfills are active, we can read the data from the DWNs without any extra code, just by using the native browser fetch API!

Even further, the urls works out of the box in any browser context, including img tags within the `src` attribute. The following code just works:

```tsx
<img src="https://dweb/${did}/read/protocols/${encodeURIComponent(protocolUri)}/avatar" />
```

Check the [`<ProfileSettings />`](./src/components/profile-settings.tsx#L147) component, to see how the avatar image is being handled (ignoring the conditional noise to handle the image file upload input).

## React + Vite-PWA

This repo was created with vite-pwa, check the default instructions below.

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |
