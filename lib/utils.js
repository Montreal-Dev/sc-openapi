import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import YAML from "yaml";

const PKG_PATH = path.resolve(process.cwd(), "package.json");

export function getPackage() {
  const text = fs.readFileSync(PKG_PATH, "utf8");
  return JSON.parse(text);
}

export function editPackage(values) {
  const pkg = getPackage();
  for (const [key, value] of Object.entries(values)) {
    pkg[key] = value;
  }
  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

export async function extractOpenApiInput(input) {
  console.log("🔨 Fetching or reading OpenAPI spec from:", input);

  let text;
  if (input.startsWith("http://") || input.startsWith("https://")) {
    const res = await fetch(input);
    if (!res.ok) throw new Error("❌ Failed to fetch spec: " + res.statusText);
    text = await res.text();
  } else {
    text = fs.readFileSync(path.resolve(process.cwd(), input), "utf8");
  }

  const pathname =
    openApiInput.startsWith("http://") || openApiInput.startsWith("https://")
      ? new URL(openApiInput).pathname
      : openApiInput;

  const extension = pathname.extname(pathname).toLowerCase();

  return { text, path: pathname, extension };
}

export function parseOpenApiSpec(text, extension) {
  let spec;
  switch (extension) {
    case ".json":
      spec = JSON.parse(text);
      console.log("✨ Parsed as JSON");
      break;
    case ".yaml":
    case ".yml":
      spec = YAML.parse(text);
      console.log("✨ Parsed as YAML");
      break;
    default:
      throw new Error(`❌ Unsupported file extension: ${extension}`);
  }
  return spec;
}

/**
 * Write a patch file for a given OpenAPI spec content.
 * @param {object} params
 * @param {string} params.text - JSON or YAML
 * @param {string} params.pathname - The base path or file name
 * @param {string} params.extension - File extensio, ".json" or ".yaml".
 */
export function createPatch({ text, pathname, extension }) {
  //# Parse
  const spec = parseOpenApiSpec(text, extension);
  const apiVersion = spec.info?.version;
  if (typeof apiVersion !== "string") {
    throw new Error("Cannot write patch: spec.info.version is not a string");
  }

  // # Write
  //- Determine base filename
  const baseName = path.basename(pathname, extension);
  const patchesDir = path.resolve(process.cwd(), "patches");
  fs.mkdirSync(patchesDir, { recursive: true });

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  const outPath = path.join(patchesDir, outFilename);

  //- Stringify
  const outText =
    extension === ".json"
      ? JSON.stringify(spec, null, 2)
      : YAML.stringify(spec);

  // # Write
  fs.writeFileSync(outPath, outText, "utf-8");

  return { outPath, apiVersion };
}
