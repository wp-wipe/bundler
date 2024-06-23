import { build } from "esbuild";
import { glob } from "glob";
import { wpWipeEsBuildImports } from "./wpwipe-esbuild-imports-plugin";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";

export async function buildBackEnd(options: BuildOptions) {
  const key = switchKey.key;
  const blocks = [...glob.sync("./blocks/**/*.block.[jt]sx"), ...glob.sync("./blocks/**/*.block.[jt]s")];
  const time = timer();
  await build({
    stdin: {
      contents: `
          import './src/admin/admin.ts';
          ${blocks.map((block) => `import './${block}'`).join(";\n")}
          `,
      resolveDir: "./",
      loader: "ts",
    },
    outfile: options.outFolder+"/admin.js",
    minify: options.minimify,
    bundle: true,
    loader: {
      ".js": "jsx",
      ".tsx": "tsx",
    },
    jsxFactory: "window.wp.element.createElement",
    jsxFragment: "window.wp.element.Fragment",
    plugins: [
      wpWipeEsBuildImports(),
      wpWipeEsBuildStyle(),
    ],
    format: "iife",
  })
    .then(() => {
      if (key === switchKey.key) {
        spacebetween(`Backend build successful`, ` ${time()} ms`, 40);
      }
    })
    .catch(() => {});
}
