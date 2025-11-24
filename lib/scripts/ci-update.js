import {
  createPatch,
  editPackage,
  extractOpenApiInput,
  getPackage,
} from '../utils';

async function main() {
  const pkg = getPackage();
  const openApiSource = pkg.input;

  const { text, pathname, extension } =
    await extractOpenApiInput(openApiSource);
  const version = getOpenApiVersion(text, extension);

  editPackage({ version });
  createPatch({ text, pathname, extension });

  console.log(`✅ OpenAPI updated to version ${version}`);
  process.exit(0);
}

main();
