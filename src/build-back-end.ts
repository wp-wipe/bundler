import { build } from "esbuild";
import { glob } from "glob";
import { existsSync } from "fs";
import { wpWipeEsBuildImports } from "./wpwipe-esbuild-imports-plugin";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween, center } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";
import type { BuildFailure, BuildResult, BuildOptions as EsBuildOptions, Plugin } from "esbuild";
import vuePlugin from "esbuild-plugin-vue3";
import {sassPlugin} from 'esbuild-sass-plugin'

export async function buildBackEnd(options: BuildOptions) {
  try {
    const key = switchKey.key;
    const blocks = [...glob.sync("./blocks/**/*.block.[jt]sx"), ...glob.sync("./blocks/**/*.block.[jt]s")];
    const time = timer();

    let entryPoints = options.adminFolder;
    if (entryPoints.substring(0, 1) !== "/" && entryPoints.substring(0, 1) !== ".") entryPoints = "/" + entryPoints;
    if (entryPoints.substring(0, 1) !== ".") entryPoints = "./" + entryPoints;
    let outName = entryPoints.split("/").pop();

    outName = outName
      ?.split(".")
      .splice(0, outName.split(".").length - 1)
      .join(".");

    if (!existsSync(entryPoints)) return;

    const plugins = [wpWipeEsBuildImports(), wpWipeEsBuildStyle(), vuePlugin(), sassPlugin()] as Plugin[];
    const config: EsBuildOptions = {
      outfile: `${options.outFolder}/${outName}.js`,
      minify: options.minimify,
      bundle: true,
      loader: {
        ".js": "jsx",
        ".tsx": "tsx",
      },
      jsxFactory: "window.wp.element.createElement",
      jsxFragment: "window.wp.element.Fragment",
      plugins,
      format: "iife",
      sourcemap: options.map,
    };

    if (blocks.length > 0) {
      config.stdin = {
        contents: `
          import './${entryPoints}';
          ${blocks.map((block) => `import './${block}'`).join(";\n")}
import { Generator } from 'npm-dts';
          `,
        resolveDir: "./",
        loader: "ts",
      };
    } else {
      config.entryPoints = [entryPoints];
    }

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
      spacebetween(`Backend build successful`, ` ${time()} ms`, 40);
    }
    return;
  } catch (error) {
    center(`Frontend build error`, 40);
    console.error(error);
  }
}
