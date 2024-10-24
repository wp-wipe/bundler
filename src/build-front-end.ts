import { build } from "esbuild";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween, center } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";
import { existsSync } from "fs";
import vuePlugin from "esbuild-plugin-vue3";
import { sassPlugin } from "esbuild-sass-plugin";

import type { BuildFailure, BuildResult, BuildOptions as EsBuildOptions, Plugin } from "esbuild";
export async function buildFrontEnd(options: BuildOptions) {
  try {
    const key = switchKey.key;
    const time = timer();

    let entryPoints = options.publicFolder;
    if (entryPoints.substring(0, 1) !== "/" && entryPoints.substring(0, 1) !== ".") entryPoints = "/" + entryPoints;
    if (entryPoints.substring(0, 1) !== ".") entryPoints = "./" + entryPoints;
    let outName = entryPoints.split("/").pop();

    outName = outName
      ?.split(".")
      .splice(0, outName.split(".").length - 1)
      .join(".");

    if (!existsSync(entryPoints)) return;

    const plugins = [wpWipeEsBuildStyle(), vuePlugin(), sassPlugin()] as Plugin[];

    const config: EsBuildOptions = {
      entryPoints: [entryPoints],
      outfile: `${options.outFolder}/${outName}.js`,
      bundle: true,
      minify: options.minimify,
      drop: ["debugger", "console"],
      plugins,
      format: "iife",
      sourcemap: options.map,
    };
    const builds = [] as Promise<BuildResult | BuildFailure>[];
    if (options.esm)
      builds.push(
        build({
          ...config,
          format: "esm",
          outfile: `${options.outFolder}/${outName}.esm.js`,
        })
      );

    if (options.cjs)
      builds.push(
        build({
          ...config,
          format: "cjs",
          outfile: `${options.outFolder}/${outName}.cjs.js`,
        })
      );

    if (options.iife)
      builds.push(
        build({
          ...config,
          format: "iife",
          outfile: `${options.outFolder}/${outName}.js`,
        })
      );

    await Promise.allSettled(builds);

    if (key === switchKey.key) {
      spacebetween(`Frontend build successful`, ` ${time()} ms`, 40);
    }
  } catch (error) {
    center(`Frontend build error`, 40);
    console.error(error);
  }
}
