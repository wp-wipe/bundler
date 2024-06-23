#!/usr/bin/env node
import { buildBackEnd } from "./build-back-end";
import { buildFrontEnd } from "./build-front-end";
import { center, line, timer, spacebetween } from "./utils";
import { watch } from "chokidar";
import { switchKey } from "./switchKey";
import { BuildOptions } from "./types";

function watcher(options: BuildOptions) {
  watch("./**/*", {
    ignored: options.outFolder,
    usePolling: true,
  }).on("all", (event) => {
    if (event === "change") {
      build(options);
    }
  });
}

export async function build(options: BuildOptions) {
  switchKey.generate();
  const key = switchKey.key;

  console.clear();

  line(40);
  center(`WP WIPE BUILD`, 40);
  line(40);
  const time = timer();
  await Promise.all([buildBackEnd(options), buildFrontEnd(options)]); //,
  if (key !== switchKey.key) return;
  line(40);
  spacebetween(`Build completed`, ` ${time()} ms`, 40);
  line(40);
}

function init() {
  let watch = false;
  let minimify = false;
  let outFolder = "dist";
  process.argv.forEach(function (val, index, array) {
    if (val === "--help") {
      console.log(`
      Usage: wipe-build [options]

      Options:
        --watch     Watch for file changes
        --help      Show help
      `);
      process.exit(0);
    }
    if (val === "--watch") watch = true;
    if (val === "-w") watch = true;
    if (val === "--minify") minimify = true;
    if (val === "-m") minimify = true;
    if (val === "--out") outFolder = array[index + 1];
  });

  const options: BuildOptions = {
    watch,
    minimify,
    outFolder,
  };

  if (watch) watcher(options);
  build(options);
}

init();
