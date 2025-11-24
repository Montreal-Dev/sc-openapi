import {
  createPatch,
  editPackage,
  extractOpenApiSource,
  getOpenApiVersion,
  getPackage,
} from '../utils.js';

async function main() {
  const pkg = getPackage();
  const openApiSource = pkg.source;

  const { text, pathname, extension } =
    await extractOpenApiSource(openApiSource);
  const version = getOpenApiVersion(text, extension);

  editPackage({ version });
  createPatch({ text, pathname, extension });

  console.log(`✅ OpenAPI updated to version ${version}`);
  process.exit(0);
}

main();
