import fs from "fs-extra";
import jiti from "jiti";
import fetch from "node-fetch";
import { OpenAPIV3 } from "openapi-types";
import { isAbsolute, join } from "path";
import { config, Config } from "./config";
import { Paths } from "./generator/paths";
import { Parser } from "./parser/parser";

export { defineConfig } from "./config";

async function main() {
  const rootDir = process.cwd();

  const require = jiti(rootDir, { interopDefault: true, esmResolve: true });

  try {
    const runtimeConfig = require("./clean.config") as Config;

    Object.assign(config, runtimeConfig);

    const { url, outDir } = config;

    if (outDir) {
      Paths.setOutPath(outDir);
    }
    console.time("Time:");
    if (url.startsWith("http")) {
      let doc = await fetch(url).then((r) => r.json());
      const parser = new Parser();
      await parser.parse(doc as OpenAPIV3.Document, url);
    } else {
      let u = isAbsolute(url) ? url : join(process.cwd(), url);
      const text = fs.readFileSync(u, "utf-8");
      const doc = JSON.parse(text);
      const parser = new Parser();
      await parser.parse(doc as unknown as OpenAPIV3.Document, u);
    }
    console.timeEnd("Time:");
  } catch (e) {}
}

main();
