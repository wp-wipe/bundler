#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/build.ts
var build_exports = {};
__export(build_exports, {
  build: () => build3,
  wpWipeEsBuildImports: () => wpWipeEsBuildImports,
  wpWipeEsBuildStyle: () => wpWipeEsBuildStyle
});
module.exports = __toCommonJS(build_exports);

// src/build-back-end.ts
var import_esbuild = require("esbuild");
var import_glob = require("glob");
var import_fs2 = require("fs");

// src/wpwipe-esbuild-imports-plugin.ts
var import_promises = __toESM(require("fs/promises"));

// src/wordpress-modules.ts
var windowedModules = {
  "@wordpress/a11y": "window.wp.a11y",
  "@wordpress/api-fetch": "window.wp.apiFetch",
  "@wordpress/block-editor": "window.wp.blockEditor",
  "@wordpress/blocks": "window.wp.blocks",
  "@wordpress/components": "window.wp.components",
  "@wordpress/compose": "window.wp.compose",
  "@wordpress/data": "window.wp.data",
  "@wordpress/element": "window.wp.element",
  "@wordpress/hooks": "window.wp.hooks",
  "@wordpress/i18n": "window.wp.i18n",
  "@wordpress/plugins": "window.wp.plugins",
  "@wordpress/server-side-render": "window.wp.serverSideRender",
  "@wordpress/url": "window.wp.url",
  "@wordpress/viewport": "window.wp.viewport",
  "@wordpress/edit-post": "window.wp.editPost",
  "@wordpress/edit-widgets": "window.wp.editWidgets",
  "@wordpress/editor": "window.wp.editor",
  "@wordpress/format-library": "window.wp.formatLibrary",
  "@wordpress/notices": "window.wp.notices",
  "@wordpress/nux": "window.wp.nux",
  "@wordpress/rich-text": "window.wp.richText",
  "@wordpress/token-list": "window.wp.tokenList",
  "@wordpress/date": "window.wp.date",
  "@wordpress/dom": "window.wp.dom",
  "@wordpress/keycodes": "window.wp.keycodes",
  "@wordpress/wordcount": "window.wp.wordcount",
  "@wordpress/blob": "window.wp.blob",
  "@wordpress/block-directory": "window.wp.blockDirectory",
  "@wordpress/block-library": "window.wp.blockLibrary"
};

// src/wpwipe-esbuild-imports-plugin.ts
var import_crypto = require("crypto");
function transformJsImports(input) {
  const importRegex = /import\s*(\{?[^}^;]+\}?)\s*\s*from\s*["'](@wordpress\/[^"']+)["']?/g;
  const output = input.replace(importRegex, (match, treeShakenImports, sourceModule) => {
    if (!windowedModules[sourceModule]) return match;
    const unwrappedImports = treeShakenImports.replace("{", "").replace("}", "");
    const formattedImports = unwrappedImports.split(",").map((importName) => {
      if (importName.trim().match(/^type /)) {
        return null;
      }
      return importName.replace(" as ", ": ");
    }).filter(Boolean).join(", ");
    if (treeShakenImports.match("{.*}")) return `const { ${formattedImports} } = ${windowedModules[sourceModule]};`;
    return `const ${formattedImports} = ${windowedModules[sourceModule]};`;
  });
  return output;
}
var buildCache = /* @__PURE__ */ new Map();
function wpWipeEsBuildImports() {
  return {
    name: "WpWipeEsBuildImports",
    setup(build4) {
      build4.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        if (args.path.includes("node_modules")) return;
        const contents = await import_promises.default.readFile(args.path, "utf8");
        const hash = (0, import_crypto.createHash)("sha256").update(contents).digest("hex");
        if (buildCache.has(hash)) {
          return {
            contents: buildCache.get(hash),
            loader: "tsx"
          };
        }
        const formattedContent = transformJsImports(contents);
        buildCache.set(hash, formattedContent);
        return {
          contents: formattedContent,
          loader: "tsx"
        };
      });
    }
  };
}

// src/wpwipe-esbuild-style-plugin.ts
var import_promises2 = __toESM(require("fs/promises"));
var import_fs = require("fs");
var import_path = require("path");
var import_tailwindcss = __toESM(require("tailwindcss"));
var import_postcss = __toESM(require("postcss"));
var import_path2 = __toESM(require("path"));
var sass = __toESM(require("sass"));
var cssExtentions = [".css", ".scss", ".sass", ".less", ".styl"];
function getCssImports(folder) {
  let returnList = [];
  (0, import_fs.readdirSync)(folder).forEach((child) => {
    if (child.startsWith("node_modules")) return;
    if (child.startsWith(".")) return;
    if ((0, import_fs.statSync)((0, import_path.resolve)(folder, child)).isDirectory()) returnList.push(...getCssImports((0, import_path.resolve)(folder, child)));
    if (cssExtentions.some((ext) => child.endsWith(".block" + ext))) returnList.push(folder + "/" + child);
  });
  return returnList;
}
async function buildTailwindCss(filename) {
  let from;
  const folders = import_path2.default.resolve(filename).split("/");
  while (folders.length > 0) {
    const folder = folders.join("/");
    if ((0, import_fs.existsSync)(folder + "/tailwind.config.js")) {
      from = folder + "/tailwind.config.js";
      break;
    }
    folders.pop();
  }
  if (!from) return "";
  const css = `

@tailwind components;
@tailwind utilities;
`;
  const results = await (0, import_postcss.default)([import_tailwindcss.default]).process(css, { from });
  return results.css;
}
function wpWipeEsBuildStyle(options) {
  return {
    name: "WpWipeEsBuildStyle",
    setup(build4) {
      build4.onLoad({ filter: /.*\.s?css$/ }, async (args) => {
        if (args.path.includes("node_modules")) return;
        const contents = await import_promises2.default.readFile(args.path, "utf8");
        if (contents.indexOf("@blocks") == -1 && contents.indexOf("@tailwind") == -1) return;
        const resolveDir = args.path.split("/").slice(0, -1).join("/");
        let newContent = contents;
        if (contents.indexOf("@blocks") != -1) {
          const filenames = getCssImports(".");
          newContent = newContent.replace("@blocks;", filenames.map((file) => (0, import_fs.readFileSync)(file, "utf8")).join("\n"));
        }
        if (newContent.indexOf("@tailwind;") !== -1) {
          let tailwindContent = await buildTailwindCss(args.path);
          if (options == null ? void 0 : options.tailwindPrefix) {
            tailwindContent = `${options == null ? void 0 : options.tailwindPrefix} {${tailwindContent}}`;
          }
          newContent = newContent.replace("@tailwind;", tailwindContent);
        }
        newContent = sass.compileString(newContent, {
          loadPaths: [import_path2.default.resolve(args.path).split("/").slice(0, -1).join("/")]
        }).css.toString();
        return { contents: newContent, loader: "css", resolveDir };
      });
    }
  };
}

// src/utils.ts
function line(length = 0) {
  console.log(Array(length).fill("-").join(""));
}
function center(text, length = 0) {
  const left = Math.round((length - text.length) / 2);
  console.log(
    Array(left > 0 ? left : 0).fill(" ").join("") + text
  );
}
function spacebetween(text1, text2, length = 0) {
  const totalLength = text1.length + text2.length;
  const space = length - totalLength;
  if (space < 1) return console.log(text1 + " " + text2);
  console.log(text1 + Array(space).fill(" ").join("") + text2);
}
function timer() {
  const startTime = Number(/* @__PURE__ */ new Date());
  return () => {
    const endTime = Number(/* @__PURE__ */ new Date());
    const timeDiff = endTime - startTime;
    return timeDiff;
  };
}

// src/switchKey.ts
var switchKey = {
  key: Math.random().toString(36).substring(7),
  generate() {
    this.key = Math.random().toString(36).substring(7);
  }
};

// src/build-back-end.ts
async function buildBackEnd(options) {
  try {
    const key = switchKey.key;
    const blocks = [...import_glob.glob.sync("./blocks/**/*.block.[jt]sx"), ...import_glob.glob.sync("./blocks/**/*.block.[jt]s")];
    const time = timer();
    let entryPoints = options.adminFolder;
    if (entryPoints.substring(0, 1) !== "/" && entryPoints.substring(0, 1) !== ".") entryPoints = "/" + entryPoints;
    if (entryPoints.substring(0, 1) !== ".") entryPoints = "./" + entryPoints;
    let outName = entryPoints.split("/").pop();
    outName = outName == null ? void 0 : outName.split(".").splice(0, outName.split(".").length - 1).join(".");
    if (!(0, import_fs2.existsSync)(entryPoints)) return;
    const config = {
      outfile: `${options.outFolder}/${outName}.js`,
      minify: options.minimify,
      bundle: true,
      loader: {
        ".js": "jsx",
        ".tsx": "tsx"
      },
      jsxFactory: "window.wp.element.createElement",
      jsxFragment: "window.wp.element.Fragment",
      plugins: [wpWipeEsBuildImports(), wpWipeEsBuildStyle()],
      format: "iife",
      sourcemap: options.map
    };
    if (blocks.length > 0) {
      config.stdin = {
        contents: `
          import './${entryPoints}';
          ${blocks.map((block) => `import './${block}'`).join(";\n")}
          `,
        resolveDir: "./",
        loader: "ts"
      };
    } else {
      config.entryPoints = [entryPoints];
    }
    const builds = [];
    if (options.esm)
      builds.push(
        (0, import_esbuild.build)({
          ...config,
          format: "esm",
          outfile: `${options.outFolder}/${outName}.esm.js`
        })
      );
    if (options.cjs)
      builds.push(
        (0, import_esbuild.build)({
          ...config,
          format: "cjs",
          outfile: `${options.outFolder}/${outName}.cjs.js`
        })
      );
    if (options.iife)
      builds.push(
        (0, import_esbuild.build)({
          ...config,
          format: "iife",
          outfile: "dist/index.js"
        })
      );
    await Promise.allSettled(builds);
    if (key === switchKey.key) {
      spacebetween(`Backend build successful`, ` ${time()} ms`, 40);
    }
  } catch (error) {
    center(`Frontend build error`, 40);
    console.error(error);
  }
}

// src/build-front-end.ts
var import_esbuild2 = require("esbuild");
var import_fs3 = require("fs");
var import_npm_dts = require("npm-dts");
async function buildFrontEnd(options) {
  try {
    const key = switchKey.key;
    const time = timer();
    let entryPoints = options.publicFolder;
    if (entryPoints.substring(0, 1) !== "/" && entryPoints.substring(0, 1) !== ".") entryPoints = "/" + entryPoints;
    if (entryPoints.substring(0, 1) !== ".") entryPoints = "./" + entryPoints;
    let outName = entryPoints.split("/").pop();
    outName = outName == null ? void 0 : outName.split(".").splice(0, outName.split(".").length - 1).join(".");
    if (!(0, import_fs3.existsSync)(entryPoints)) return;
    new import_npm_dts.Generator({
      entry: `${options.outFolder}/${outName}.js`,
      output: `${options.outFolder}/${outName}.d.ts`
    }).generate();
    const config = {
      entryPoints: [entryPoints],
      outfile: `${options.outFolder}/${outName}.js`,
      bundle: true,
      minify: options.minimify,
      drop: ["debugger", "console"],
      plugins: [wpWipeEsBuildStyle()],
      format: "iife",
      sourcemap: options.map
    };
    const builds = [];
    if (options.esm)
      builds.push(
        (0, import_esbuild2.build)({
          ...config,
          format: "esm",
          outfile: `${options.outFolder}/${outName}.esm.js`
        })
      );
    if (options.cjs)
      builds.push(
        (0, import_esbuild2.build)({
          ...config,
          format: "cjs",
          outfile: `${options.outFolder}/${outName}.cjs.js`
        })
      );
    if (options.iife)
      builds.push(
        (0, import_esbuild2.build)({
          ...config,
          format: "iife",
          outfile: "dist/index.js"
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

// src/build.ts
var import_chokidar = require("chokidar");
function watcher(options) {
  (0, import_chokidar.watch)("./**/*", {
    ignored: options.outFolder,
    usePolling: true
  }).on("all", (event) => {
    if (event === "change") {
      build3(options);
    }
  });
}
async function build3(options) {
  switchKey.generate();
  const key = switchKey.key;
  console.clear();
  line(40);
  center(`WP WIPE BUILD`, 40);
  line(40);
  const time = timer();
  await Promise.allSettled([buildBackEnd(options), buildFrontEnd(options)]);
  if (key !== switchKey.key) return;
  line(40);
  spacebetween(`Build completed`, ` ${time()} ms`, 40);
  line(40);
}
function init() {
  let watch2 = false;
  let minimify = false;
  let outFolder = "dist";
  let adminFolder = "src/admin/admin.ts";
  let publicFolder = "src/public/public.ts";
  let esm = false;
  let cjs = false;
  let iife = false;
  let map = false;
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
        watch2 = true;
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
      case "--esm":
        esm = true;
        break;
      case "--cjs":
        cjs = true;
        break;
      case "--iife":
        iife = true;
        break;
      case "--map":
        map = true;
        break;
    }
  }
  if (!cjs && !esm && !iife) {
    iife = true;
  }
  const options = {
    watch: watch2,
    minimify,
    outFolder,
    adminFolder,
    publicFolder,
    esm,
    cjs,
    iife,
    map
  };
  if (watch2) watcher(options);
  build3(options);
}
init();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  build,
  wpWipeEsBuildImports,
  wpWipeEsBuildStyle
});
