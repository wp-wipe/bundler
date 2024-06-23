import { build } from "esbuild";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";
import { existsSync } from "fs";

export async function buildFrontEnd(options: BuildOptions) {
  const key = switchKey.key;
  const time = timer();

  let entryPoints = options.publicFolder;
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
    entryPoints: [entryPoints],
    outfile: options.outFolder + "/" + outName,
    bundle: true,
    minify: options.minimify,
    drop: ["debugger", "console"],
    plugins: [wpWipeEsBuildStyle()],
    format: "iife",
  })
    .then(() => {
      if (key === switchKey.key) {
        spacebetween(`Frontend build successful`, ` ${time()} ms`, 40);
      }
    })
    .catch((e) => {});
}
