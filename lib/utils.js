import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import YAML from 'yaml';

const PKG_PATH = path.resolve(process.cwd(), 'package.json');
const PATCHES_DIR = path.resolve(process.cwd(), 'patches');
/**
 * Get the package.json file.
 * @returns {object} The package.json file.
 */
export function getPackage() {
  const text = fs.readFileSync(PKG_PATH, 'utf8');
  return JSON.parse(text);
}

/**
 * Edit the package.json file.
 * @param {object} values - The values to update.
 */
export function editPackage(values) {
  const pkg = getPackage();
  for (const [key, value] of Object.entries(values)) {
    pkg[key] = value;
    console.log(`🔧 Updated ${key} to ${value}`);
  }
  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

/**
 * Extract an OpenAPI spec from a URL or local file path.
 * @param {string} input - URL or local file path
 * @returns {object} An object with `text`, `pathname` and `extension` properties.
 * @returns {string} text - The OpenAPI spec as JSON or YAML
 * @returns {string} pathname - The base path or file name
 * @returns {string} extension - File extension, ".json" or ".yaml".
 */
export async function extractOpenApiSource(input) {
  console.log('🔨 Extracting OpenAPI spec from:', input);
  let text;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetch(input);
    if (!res.ok) throw new Error('❌ Failed to fetch spec: ' + res.statusText);
    text = await res.text();
  } else {
    text = fs.readFileSync(path.resolve(process.cwd(), input), 'utf8');
  }

  const pathname =
    input.startsWith('http://') || input.startsWith('https://')
      ? new URL(input).pathname
      : input;

  const extension = path.extname(pathname).toLowerCase();

  return { text, pathname, extension };
}

/**
 * Parse an OpenAPI spec from text.
 * @param {string} text - JSON or YAML
 * @param {string} extension - File extension, ".json" or ".yaml".
 */
export function parseOpenApiSpec(text, extension) {
  let spec;
  switch (extension) {
    case '.json':
      spec = JSON.parse(text);
      console.log('✨ Parsed as JSON');
      break;
    case '.yaml':
    case '.yml':
      spec = YAML.parse(text);
      console.log('✨ Parsed as YAML');
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
 * @param {string} params.extension - File extension, ".json" or ".yaml".
 */
export function createPatch({ text, pathname, extension }) {
  //# Parse
  const spec = parseOpenApiSpec(text, extension);
  const apiVersion = spec.info?.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('Cannot write patch: spec.info.version is not a string');
  }

  // # Write
  //- Determine base filename
  const baseName = path.basename(pathname, extension);
  fs.mkdirSync(PATCHES_DIR, { recursive: true });

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  const outPath = path.join(PATCHES_DIR, outFilename);

  //- Stringify
  const outText =
    extension === '.json'
      ? JSON.stringify(spec, null, 2)
      : YAML.stringify(spec);

  // # Write
  fs.writeFileSync(outPath, outText, 'utf-8');

  console.log(`✅ Wrote ${outPath}`);

  return { outPath, apiVersion };
}

/**
 * Get pathname to patch file.
 * @param {string} [version] - The API version.
 */
export async function getPatchPath(version = null) {
  const pkg = getPackage();
  const openApiSource = pkg.source;
  const openApiVersion = pkg.version;

  if (typeof openApiSource !== 'string') {
    console.error(
      '❌ package.json `input` field must be a string (URL or local path)',
    );
    process.exit(1);
  }

  const apiVersion = version || openApiVersion;
  if (!apiVersion) {
    throw new Error('❌ Cannot get patch file path: no API version found');
  }

  const { pathname, extension } = await extractOpenApiSource(openApiSource);
  const baseName = path.basename(pathname, extension);

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  return path.join(PATCHES_DIR, outFilename);
}

/**
 * Get the OpenAPI version from a spec text.
 * @param specText - The spec text.
 * @param extension - The file extension.
 * @returns The OpenAPI version.
 */
export function getOpenApiVersion(specText, extension) {
  switch (extension) {
    case '.json':
      return JSON.parse(specText)?.info?.version;
    case '.yaml':
    case '.yml':
      return YAML.parse(specText)?.info?.version;
    default:
      throw new Error('Unknown file extension: ' + extension);
  }
}
