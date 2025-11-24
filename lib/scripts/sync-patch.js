import {
  createPatch,
  extractOpenApiSource,
  getPackage,
  parseOpenApiSpec,
} from '../utils.js';

async function main() {
  const pkg = getPackage();
  const openApiSource = pkg.source;

  if (typeof openApiSource !== 'string') {
    console.error(
      '❌ package.json `input` field must be a string (URL or local path)',
    );
    process.exit(1);
  }

  // # Extract
  const { text, pathname, extension } =
    await extractOpenApiSource(openApiSource);

  // # Parse
  const openApi = parseOpenApiSpec(text, extension);
  const apiVersion = openApi.info?.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('❌ Could not find `info.version` in spec');
  }
  console.log('✅ API version:', apiVersion);

  // # Write
  createPatch({ text, pathname, extension });
  console.log(`✔️ Wrote patched spec to ${pathname}`);
}

main().catch((err) => {
  console.error('❌ Error in sync-patch:', err);
  process.exit(1);
});
