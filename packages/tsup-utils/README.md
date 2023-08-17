# tsup

This package provides a default [tsup](https://tsup.egoist.dev/) setup. tsup is a bundler. It uses esbuild under the hood.

## Usage

In every package or app that you wish to use tsup as a bundler, install this as a dev dependency:

```bash
pnpm --filter your-package add -D -w @tooling/tsup
```

Then add a `tsup.config.js` file in the root of that package:

```js
module.exports = require('@tooling/tsup');
```

**You do not need to install tsup as a dependency.** It is already included as a dependency of this package.

You should also update your `package.json` to include the following properties, to setup scripts and entrypoints:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/typing/index.d.ts",
  "scripts": {
    "setup": "tsup src/index.ts",
    "build": "tsup src/index.ts",
    "dev": "tsup src/index.ts --watch"
  }
}
```

## Features

Out of the box, it

- compiles your code to both CJS (`dist/index.cjs`) and ESM (`dist/index.mjs`)
- generates `.d.ts` files in a separate step using `tsc` to `dist/typing/index.d.ts`
- generates both source maps and declaration maps
- copies `.less` files as-is
- supports SVG files as React components via `esbuild-plugin-svgr`
