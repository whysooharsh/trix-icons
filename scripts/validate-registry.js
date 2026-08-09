#!/usr/bin/env node
/**
 * scripts/validate-registry.js
 *
 * Validates the generated registry/icons.json for correctness and consistency.
 * Run after build-registry.js to verify the output.
 *
 * Usage: node scripts/validate-registry.js
 */

import { readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { constants } from "node:fs";

const ROOT = resolve(import.meta.dirname, "..");
const REGISTRY_PATH = join(ROOT, "registry", "icons.json");

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Validating registry...\n");

  if (!(await fileExists(REGISTRY_PATH))) {
    console.error("registry/icons.json not found.");
    console.error("Run 'npm run registry:build' first.");
    process.exit(1);
  }

  let registry;
  try {
    const content = await readFile(REGISTRY_PATH, "utf-8");
    registry = JSON.parse(content);
  } catch (error) {
    console.error(`Cannot read registry: ${error.message}`);
    process.exit(1);
  }

  const errors = [];

  // Verify _generated marker
  if (registry._generated !== true) {
    errors.push('Registry is missing "_generated: true" marker. Was it edited manually?');
  }

  if (!Array.isArray(registry.icons)) {
    errors.push('Registry must have an "icons" array.');
    printResults(errors, []);
    return;
  }

  const slugsSeen = new Set();
  const warnings = [];

  for (const entry of registry.icons) {
    const source = `icons[${entry.slug ?? "?"}]`;

    // Slug uniqueness
    if (slugsSeen.has(entry.slug)) {
      errors.push(`${source}: Duplicate slug "${entry.slug}"`);
    } else {
      slugsSeen.add(entry.slug);
    }

    // Stable icons must have a component file
    if (entry.status === "stable" && !entry.files?.component) {
      errors.push(`${source}: Stable icon has no component file. Set status to "experimental" or create the component.`);
    }

    // Referenced files must exist (spot-check the component)
    if (entry.files?.component) {
      const componentPath = join(ROOT, entry.files.component);
      if (!(await fileExists(componentPath))) {
        errors.push(`${source}: Component file does not exist: "${entry.files.component}"`);
      }
    }

    if (entry.files?.svg) {
      const svgPath = join(ROOT, entry.files.svg);
      if (!(await fileExists(svgPath))) {
        errors.push(`${source}: SVG file does not exist: "${entry.files.svg}"`);
      }
    }

    // Warn about brand icons pending review
    if (entry.provenance?.reviewRequired === true && entry.status === "stable") {
      errors.push(`${source}: provenance.reviewRequired is true but status is "stable". This is invalid.`);
    }

    if (entry.provenance?.reviewRequired === true) {
      warnings.push(`${source}: Pending provenance review. Do not include in public release without resolution.`);
    }
  }

  printResults(errors, warnings, registry.icons.length);
}

function printResults(errors, warnings, iconCount) {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const w of warnings) {
      console.log(`  ⚠ ${w}`);
    }
    console.log();
  }

  if (errors.length > 0) {
    console.error("Errors:");
    for (const e of errors) {
      console.error(`  ✗ ${e}`);
    }
    console.log();
    console.error(`Registry validation failed: ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`✓ Registry validated: ${iconCount ?? 0} icon(s).\n`);
}

main().catch((error) => {
  console.error("Unexpected error during registry validation:", error);
  process.exit(1);
});
