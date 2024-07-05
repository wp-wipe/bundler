#!/usr/bin/env node
import { buildBackEnd } from "./build-back-end";
import { buildFrontEnd } from "./build-front-end";
import { center, line, timer, spacebetween } from "./utils";
import { watch } from "chokidar";
import { switchKey } from "./switchKey";
import { BuildOptions } from "./types";
import { wpWipeEsBuildStyle } from "./wpwipe-esbuild-style-plugin";
import { wpWipeEsBuildImports } from "./wpwipe-esbuild-imports-plugin";
import * as esbuild from 'esbuild'

export { wpWipeEsBuildStyle, wpWipeEsBuildImports };

function watcher(options: BuildOptions) {
  watch("./**/*", {
    ignored: options.outFolder,
    usePolling: false,
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

  await Promise.allSettled([buildBackEnd(options), buildFrontEnd(options)]); //,
  if (key !== switchKey.key) return;
  line(40);
  spacebetween(`Build completed`, ` ${time()} ms`, 40);
  line(40);
  esbuild.stop()
}

function init() {
  const options: BuildOptions = {
    watch: false,
    minimify: false,
    outFolder: "dist",
    adminFolder: "src/admin/admin.ts",
    publicFolder: "src/public/public.ts",
    esm: false,
    cjs: false,
    iife: false,
    map: false,
    dts: false,
  };

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
        --esm       Output ESM
        --cjs       Output CJS
        --iife      Output IIFE
        
      `);
      process.exit(0);
    }
    switch (val) {
      case "--watch":
      case "-w":
        options.watch = true;
        break;
      case "--minify":
        options.minimify = true;
        break;
      case "-m":
        options.minimify = true;
        break;
      case "--out":
        options.outFolder = args.shift() || options.outFolder;
        break;
      case "--admin":
        options.adminFolder = args.shift() || options.adminFolder;
        break;
      case "--public":
        options.publicFolder = args.shift() || options.publicFolder;
        break;
      case "--esm":
        options.esm = true;
        break;
      case "--cjs":
        options.cjs = true;
        break;
      case "--iife":
        options.iife = true;
        break;
      case "--map":
        options.map = true;
        break;
    }
  }
  if (!options.cjs && !options.esm && !options.iife) {
    options.iife = true;
  }

  if (options.watch) watcher(options);
  build(options);
}

init();
