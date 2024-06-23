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
  //

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
  let adminFolder = "src/admin/admin.ts";
  let publicFolder = "src/public/public.ts";

  const args = process.argv.slice(2);
  while (args.length > 0) {
    const val = args.shift();

    if (val === "--help") {
      console.log(`
      Usage: wipe-build [options]

      Options:
        --watch     Watch for file changes
        --help      Show help
        --minify    Minify the output
        --out       Output folder
        --admin     Admin input file
        --public    Public input file
      `);
      process.exit(0);
    }
    switch (val) {
      case "--watch":
      case "-w":
        watch = true;
        break;
      case "--minify":
        minimify = true;
        break;
      case "-m":
        minimify = true;
        break;
      case "--out":
        outFolder = args.shift() || outFolder;
        break;
      case "--admin":
        adminFolder = args.shift() || adminFolder;
        break;
      case "--public":
        publicFolder = args.shift() || publicFolder;
        break;
    }
  }

  const options: BuildOptions = {
    watch,
    minimify,
    outFolder,
    adminFolder,
    publicFolder,
  };

  if (watch) watcher(options);
  build(options);
}

init();
