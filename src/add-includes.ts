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
import { sassPlugin } from "esbuild-sass-plugin";

export async function addIncludes(options: BuildOptions) {
  // find all file that ends in .inc.php
  // and generate a list of file to includes
  const includes = glob.sync("./**/*.inc.php");
  const key = switchKey.key;
  const time = timer();

  // get the parth relative to the options.outFolder
  const relative = options.outFolder
    ? options.outFolder
        .split(/[\\|\/]/)
        .map((a) => "..")
        .join("/") + "/"
    : "";

  const content = includes.map((file) => `include(__DIR__.'/${relative}${file}');`).join("\n");
  //write to a file .includes.php
  const file = `${options.outFolder}/includes.php`;
  if (!existsSync(options.outFolder)) return;

  // write content to file
  require("fs").writeFileSync(
    file,
    `<?php 
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
${content}\n`
  );

  if (key === switchKey.key) {
    spacebetween(`Includes generated`, ` ${time()} ms`, 36);
  }
  return;
}
