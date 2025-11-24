import {
  getPackage,
  editPackage,
  extractOpenApiSource,
  parseOpenApiSpec,
} from '../utils.js';

async function main() {
  const pkg = getPackage();
  const openApiSource = pkg.source;
  if (typeof openApiSource !== 'string') {
    console.error(
      '❌ package.json "input" field must be a string URL or file path',
    );
    process.exit(1);
  }

  // # Extract
  const { text, extension } = await extractOpenApiSource(openApiSource);

  // # Parse
  const openApi = parseOpenApiSpec(text, extension);
  const apiVersion = openApi.info?.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('❌ Could not find `info.version` in spec');
  }
  console.log('✅ API version:', apiVersion);

  // # Edit
  editPackage({ version: apiVersion });
  console.log('🔧 Synced package.json version →', apiVersion);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
