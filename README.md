# WPWipe

> Next Generation Tooling for Wordpress Theme development

- 📦 Gutenberg Blocks
- 🛠️ Tailwind ready
- ⚡️ Blazingly fast build time
- 💡 Simple to use

# Usage

## Installation

To get started, first install the bundler to your theme

```sh
npm i @wpwipe/bundler
```

Then add the following scripts to your package.json

```json
{
  "scripts": {
    "dev": "wpwipe --watch",
    "build": "wpwipe --minify"
  }
}
```

## Configuration

### Watch

You can use the watch parameter in your command to watch the content of the root folder

```sh
wpwipe --watch
```

### Minify

You can use the --minify parameter in your command to minify the output

```sh
wpwipe --minify
```

## Gutenberg Blocks

All files ending in _.block.jsx, _.block.tsx, _.block.js, or _.block.ts will be automatically imported in your admin js file.

Likewise, if you name a file _.block.css or _.block.scss it will be included in output of the frontend and backend stylesheet if a `@blocks;` directive is present.

## Tailwind

You can use the `@tailwind;` directive ant tailwind will be included in your stylesheet. It will include component and utilities, but not the css reset (as it conflicts with basic theme styling). The files scanned for utility classes will be based on the location of the `tailwind.config.js` file

```scss
/* @tailwind base; */
@tailwind components;
@tailwind utilities;
```

** Note **
We recomend using the following structure for usage in the admin as some tailwind class my conflict with wordpress' style. (nesting is the reason why the custom `@tailwind;` exists)

```scss
.editor-styles-wrapper {
  @tailwind;
  @blocks;
}
```

## The ecosystem
