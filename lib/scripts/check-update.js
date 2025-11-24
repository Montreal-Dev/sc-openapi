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
  const localVersion = pkg.version;

  // # Compare
  const { text, pathname, extension } =
    await extractOpenApiSource(openApiSource);
  const externalVersion = getOpenApiVersion(text, extension);

  if (localVersion === externalVersion) {
    console.log('✅ Local patch is up to date.');
    process.exit(0);
  }

  // Save new OpenAPI spec
  editPackage({ version: externalVersion }); // <-- fixed
  createPatch({ text, pathname, extension });

  console.log(`✅ OpenAPI updated to version ${externalVersion}.`);
  process.exit(0);
}

main();
