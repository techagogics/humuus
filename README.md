# techagogics_open_core

Welcome to the techagogics Open Core repository! This is where innovative educational tools meet collaborative development.

## Status: Experimental

This repository is in it's very early phase and under construction.

## Getting Started

Here's what you can do with our Open Core:

- Create & Share: Develop your own educational modules and share them with a community passionate about learning.
- Customize & Enhance: Take our basic workshops and personalize them to meet diverse educational needs.
- Engage & Interact: Use our platform to create an engaging learning experience that harnesses the latest in educational technology.
  With our commitment to open-source development, we empower educators, students, and lifelong learners to come together and build a future where education is accessible, interactive, and constantly evolving. Join us in crafting the education of tomorrow, today!

Note: This repository is privacy-first and cloud-ready, ensuring that your contributions can make an impact in the most secure way possible.

Star us on GitHub and help us grow the community of educational innovators!

## Link

[Website](https://techagogics.de)

---

# Turborepo Tailwind CSS starter

This is an official starter Turborepo.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-tailwind
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) shared by both `web` and `docs` (not existant anymore) applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@humuus/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.js`. This was chosen for several reasons:

- Make sharing one `tailwind.config.js` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.js` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.js](packages/tailwind-config/tailwind.config.js):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
