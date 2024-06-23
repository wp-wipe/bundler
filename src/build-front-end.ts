import { build } from "esbuild";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { timer, spacebetween } from "./utils";
import { switchKey } from "./switchKey";
import type { BuildOptions } from "./types";

export async function buildFrontEnd(options: BuildOptions) {
  const key = switchKey.key;
  const time = timer();
  await build({
    entryPoints: ["./src/public/public.ts"],
    outfile: options.outFolder+"/public.js",
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
