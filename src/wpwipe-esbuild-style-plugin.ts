import { Plugin } from "esbuild";
import fs from "node:fs/promises";
import { readdirSync, statSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import postcss from "postcss";
import path from "path";
import * as sass from "sass";

const cssExtentions = [".css", ".scss", ".sass", ".less", ".styl"];

function getCssImports(folder: string): string[] {
  let returnList = [] as string[];
  readdirSync(folder).forEach((child) => {
    if (child.startsWith("node_modules")) return;
    if (child.startsWith(".")) return;
    if (statSync(resolve(folder, child)).isDirectory()) returnList.push(...getCssImports(resolve(folder, child)));
    if (cssExtentions.some((ext) => child.endsWith(".block" + ext))) returnList.push(folder + "/" + child);
  });

  return returnList;
}

async function buildTailwindCss(filename: string) {
  let from: string | undefined;
  // find the folder where tailwind.config is located
  const folders = path.resolve(filename).split("/");
  while (folders.length > 0) {
    const folder = folders.join("/");
    if (existsSync(folder + "/tailwind.config.js")) {
      from = folder + "/tailwind.config.js";
      break;
    }
    folders.pop();
  }
  if (!from) return "";

  const css = `

@tailwind components;
@tailwind utilities;
`;
  const results = await postcss([tailwindcss]).process(css, { from });
  return results.css;
}

export function wpWipeEsBuildStyle(options?: { tailwindPrefix: string }): Plugin {
  return {
    name: "WpWipeEsBuildStyle",
    setup(build) {
      build.onResolve({ filter: /^@assets\// }, (args) => {
        const newPath = args.path.replace(/^@assets\//, "../assets/");
        return { path: newPath, external: true };
      });
      build.onResolve({ filter: /\.(png|jpe?g|gif|svg|webp)$/ }, (args) => {
        return { path: args.path, external: true };
      });
      build.onLoad({ filter: /.*\.s?css$/ }, async (args) => {
        if (args.path.includes("node_modules")) return;

        const contents = await fs.readFile(args.path, "utf8");
        if (contents.indexOf("@blocks") == -1 && contents.indexOf("@tailwind") == -1) return;

        const resolveDir = args.path.split("/").slice(0, -1).join("/");
        let newContent = contents;

        if (contents.indexOf("@blocks") != -1) {
          const filenames = getCssImports(".");
          newContent = newContent.replace("@blocks;", filenames.map((file) => readFileSync(file, "utf8")).join("\n"));
        }

        if (newContent.indexOf("@tailwind;") !== -1) {
          let tailwindContent = await buildTailwindCss(args.path);
          if (options?.tailwindPrefix) {
            tailwindContent = `${options?.tailwindPrefix} {${tailwindContent}}`;
          }

          newContent = newContent.replace("@tailwind;", tailwindContent);
        }

        newContent = sass
          .compileString(newContent, {
            loadPaths: [path.resolve(args.path).split("/").slice(0, -1).join("/")],
          })
          .css.toString();

        return { contents: newContent, loader: "css", resolveDir };
      });
    },
  };
}
//code
