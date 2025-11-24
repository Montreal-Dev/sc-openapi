import { extractOpenApiInput, getOpenApiVersion, getPackage } from '../utils';

async function main() {
  const pkg = getPackage();
  const openApiSource = pkg.input;
  const localVersion = pkg.version;

  const { text, extension } = await extractOpenApiInput(openApiSource);
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
