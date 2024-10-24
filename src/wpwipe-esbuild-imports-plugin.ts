import { Plugin } from "esbuild";
import fs from "node:fs/promises";
import { windowedModules } from "./wordpress-modules";
import { createHash } from "crypto";

function transformJsImports(input: string): string {
  // Regular expression to match import statements
  const importRegex = /import\s*(\{?[^}^;]+\}?)\s*\s*from\s*["'](@wordpress\/[^"']+)["']?/g;

  // Function to replace import statement with const statement
  const output = input.replace(importRegex, (match: string, treeShakenImports: string, sourceModule: string) => {
    // If the source module is not in the windowedModules object, return the original import statement
    if (!windowedModules[sourceModule]) return match;

    // Remove curly braces from imports
    const unwrappedImports = treeShakenImports.replace("{", "").replace("}", "");

    // Strip types and replaces aliases
    const formattedImports = unwrappedImports
      .split(",")
      .map((importName) => {
        if (importName.trim().match(/^type /)) {
          return null;
        }
        return importName.replace(" as ", ": ");
      })
      .filter(Boolean)
      .join(", ");

    // Putback curly braces if needed
    if (treeShakenImports.match("{.*}")) return `const { ${formattedImports} } = ${windowedModules[sourceModule].replace(".", "?.")} || {};`;
    return `const ${formattedImports} = ${windowedModules[sourceModule].replace(".", "?.")} || {};`;
  });

  return output;
}

const buildCache = new Map<string, string>();

export function wpWipeEsBuildImports(): Plugin {
  return {
    name: "WpWipeEsBuildImports",
    setup(build) {
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        if (args.path.includes("node_modules")) return;
        const contents = await fs.readFile(args.path, "utf8");

        const hash = createHash("sha256").update(contents).digest("hex");

        if (buildCache.has(hash)) {
          return {
            contents: buildCache.get(hash),
            loader: "tsx",
          };
        }

        const formattedContent = transformJsImports(contents);
        buildCache.set(hash, formattedContent);

        return {
          contents: formattedContent,
          loader: "tsx",
        };
      });
    },
  };
}
//code
