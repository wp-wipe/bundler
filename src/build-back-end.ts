import { build } from "esbuild";
import { glob } from "glob";
import { existsSync } from "fs";
import { wpWipeEsBuildImports } from "./wpwipe-esbuild-imports-plugin";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";

export async function buildBackEnd(options: BuildOptions) {
  const key = switchKey.key;
  const blocks = [...glob.sync("./blocks/**/*.block.[jt]sx"), ...glob.sync("./blocks/**/*.block.[jt]s")];
  const time = timer();

  let entryPoints = options.adminFolder;
  if (entryPoints.substring(0, 1) !== "/" && entryPoints.substring(0, 1) !== ".") entryPoints = "/" + entryPoints;
  if (entryPoints.substring(0, 1) !== ".") entryPoints = "./" + entryPoints;
  let outName = entryPoints.split("/").pop();

  outName =
    outName
      ?.split(".")
      .splice(0, outName.split(".").length - 1)
      .join(".") + ".js";

  if (!existsSync(entryPoints)) return;

  await build({
    stdin: {
      contents: `
          import './${entryPoints}';
          ${blocks.map((block) => `import './${block}'`).join(";\n")}
          `,
      resolveDir: "./",
      loader: "ts",
    },
    outfile: options.outFolder + "/" + outName,
    minify: options.minimify,
    bundle: true,
    loader: {
      ".js": "jsx",
      ".tsx": "tsx",
    },
    jsxFactory: "window.wp.element.createElement",
    jsxFragment: "window.wp.element.Fragment",
    plugins: [wpWipeEsBuildImports(), wpWipeEsBuildStyle()],
    format: "iife",
  })
    .then(() => {
      if (key === switchKey.key) {
        spacebetween(`Backend build successful`, ` ${time()} ms`, 40);
      }
    })
    .catch(() => {});
}
