import {
  extractOpenApiSource,
  getOpenApiVersion,
  getPackage,
} from '../utils.js';

async function main() {
  const pkg = getPackage();
  const localVersion = pkg.version;
  const openApiSource = pkg.source;

  const { text, extension } = await extractOpenApiSource(openApiSource);
  const externalVersion = getOpenApiVersion(text, extension);

  if (localVersion === externalVersion) {
    console.log('✅ Local patch is up to date.');
    process.exit(0);
  }

  console.log(`🚨 Update available: ${localVersion} → ${externalVersion}`);
  //GitHub Actions Variable
  console.log(`changed=true`);
  process.exit(0);
}

main();
