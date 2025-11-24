import fs from "fs";
import path from "path";
import YAML from "yaml";
import { createPatch, extractOpenApiInput, getPackage } from "../utils";

async function main() {
  const pkg = getPackage();
  const openApiInput = pkg.input;

  if (typeof openApiInput !== "string") {
    console.error(
      "❌ package.json `input` field must be a string (URL or local path)"
    );
    process.exit(1);
  }

  // # Extract
  const { text, pathname, extension } = await extractOpenApiInput(openApiInput);

  // # Parse
  const openApi = parseOpenApiSpec(text, extension);
  const apiVersion = openApi.info?.version;
  if (typeof apiVersion !== "string") {
    throw new Error("❌ Could not find `info.version` in spec");
  }
  console.log("✅ API version:", apiVersion);

  // # Write
  createPatch({ text, pathname, extension });
  console.log(`✔️ Wrote patched spec to ${pathname}`);
}

main().catch((err) => {
  console.error("❌ Error in sync-patch:", err);
  process.exit(1);
});
