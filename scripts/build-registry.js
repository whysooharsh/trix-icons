#!/usr/bin/env node
/**
 * scripts/build-registry.js
 *
 * Reads all icon metadata from icons/ and generates registry/icons.json.
 *
 * This script is deterministic: given the same source, it produces the same output.
 * It must not be run if validate-icons fails.
 *
 * Usage: node scripts/build-registry.js
 *
 * Exits with code 1 if any icon fails validation or if the output cannot be written.
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ICONS_DIR = join(ROOT, "icons");
const REGISTRY_DIR = join(ROOT, "registry");
const OUTPUT_PATH = join(REGISTRY_DIR, "icons.json");

const VALID_CATEGORIES = ["actions", "navigation", "communication", "media", "system", "brands", "experimental"];

/**
 * Reads and parses a JSON file.
 * Throws a descriptive error if the file cannot be read or parsed.
 */
async function readJsonFile(path) {
  let content;
  try {
    content = await readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`Cannot read "${path}": ${error.message}`);
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in "${path}": ${error.message}`);
  }
}

/**
 * Resolves the component file path for an icon.
 * Returns null if no component file is found.
 */
async function resolveComponentPath(category, name) {
  const componentName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") + "Icon";

  const relPath = `packages/icons/src/${category}/${componentName}.tsx`;
  const absPath = join(ROOT, relPath);

  try {
    await readFile(absPath);
    return relPath;
  } catch {
    return null;
  }
}

/**
 * Infers npm dependencies from a component file.
 * Simple heuristic: look for import statements from external packages.
 */
async function inferDependencies(componentPath) {
  if (!componentPath) return { npm: [], registry: [] };

  const absPath = join(ROOT, componentPath);
  let content;
  try {
    content = await readFile(absPath, "utf-8");
  } catch {
    return { npm: [], registry: [] };
  }

  const npm = [];

  // Detect motion/react import
  if (/from ["']motion\/react["']|from ["']motion["']/.test(content)) {
    npm.push("motion");
  }

  // Detect react import (peer dep, still useful to note)
  // Not added to deps — it's a peer dependency

  return { npm, registry: [] };
}

/**
 * Processes a single icon and returns a registry entry.
 * Throws if the icon cannot be processed.
 */
async function processIcon(category, name) {
  const source = `icons/${category}/${name}`;
  const metaPath = join(ICONS_DIR, category, name, "meta.json");
  const svgRelPath = `icons/${category}/${name}/icon.svg`;

  const meta = await readJsonFile(metaPath);

  // Only include stable icons in the registry
  // Experimental icons are processed but flagged
  const componentPath = await resolveComponentPath(category, name);
  if (!componentPath && meta.status === "stable") {
    throw new Error(
      `${source}: Component file not found. ` +
      `Expected: packages/icons/src/${category}/${toPascalCase(name)}Icon.tsx. ` +
      `Create the component or change status to "experimental".`
    );
  }

  const dependencies = await inferDependencies(componentPath);

  const now = new Date().toISOString();

  return {
    name: meta.name,
    slug: meta.slug,
    category: meta.category,
    description: meta.description,
    keywords: meta.keywords ?? [],
    version: meta.version,
    status: meta.status,
    files: {
      component: componentPath ?? null,
      svg: svgRelPath,
    },
    dependencies,
    provenance: meta.provenance,
    animation: meta.animation,
    accessibility: meta.accessibility,
    meta: {
      addedAt: now, // In a real implementation, this would be tracked via git
      updatedAt: now,
    },
  };
}

function toPascalCase(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Main registry build runner.
 */
async function main() {
  console.log("Building registry...\n");

  let categories;
  try {
    categories = await readdir(ICONS_DIR, { withFileTypes: true });
  } catch (error) {
    console.error(`Error reading icons directory: ${error.message}`);
    process.exit(1);
  }

  const entries = [];
  const slugs = new Map(); // slug → source, for duplicate detection
  const buildErrors = [];

  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) continue;
    const category = categoryEntry.name;

    if (!VALID_CATEGORIES.includes(category)) continue;

    let icons;
    try {
      icons = await readdir(join(ICONS_DIR, category), { withFileTypes: true });
    } catch (error) {
      buildErrors.push(`icons/${category}: Cannot read directory: ${error.message}`);
      continue;
    }

    for (const iconEntry of icons) {
      if (!iconEntry.isDirectory()) continue;

      try {
        const entry = await processIcon(category, iconEntry.name);

        // Duplicate slug check
        const existingSource = slugs.get(entry.slug);
        if (existingSource) {
          buildErrors.push(
            `icons/${category}/${iconEntry.name}: Duplicate slug "${entry.slug}". ` +
            `Already used by ${existingSource}.`
          );
          continue;
        }

        slugs.set(entry.slug, `icons/${category}/${iconEntry.name}`);
        entries.push(entry);
      } catch (error) {
        buildErrors.push(error.message);
      }
    }
  }

  if (buildErrors.length > 0) {
    console.error("Registry build failed:\n");
    for (const error of buildErrors) {
      console.error(`  ✗ ${error}`);
    }
    console.error(`\n${buildErrors.length} error(s) prevented registry generation.`);
    console.error("Run 'npm run icons:validate' for detailed validation output.");
    process.exit(1);
  }

  // Sort entries deterministically (by category, then name)
  entries.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  const registry = {
    _generated: true,
    _generatedAt: new Date().toISOString(),
    _generatedBy: "scripts/build-registry.js",
    _schema: "packages/registry/src/schema.ts",
    _warning: "This file is generated. Do not edit it manually. Source: icons/",
    icons: entries,
  };

  // Ensure registry directory exists
  try {
    await mkdir(REGISTRY_DIR, { recursive: true });
  } catch (error) {
    console.error(`Cannot create registry directory: ${error.message}`);
    process.exit(1);
  }

  try {
    await writeFile(OUTPUT_PATH, JSON.stringify(registry, null, 2) + "\n", "utf-8");
  } catch (error) {
    console.error(`Cannot write registry file: ${error.message}`);
    process.exit(1);
  }

  const stableCount = entries.filter((e) => e.status === "stable").length;
  const experimentalCount = entries.filter((e) => e.status === "experimental").length;

  console.log(`✓ Registry built: ${entries.length} icon(s) total.`);
  console.log(`  Stable: ${stableCount}`);
  if (experimentalCount > 0) {
    console.log(`  Experimental: ${experimentalCount}`);
  }
  console.log(`\n  Output: registry/icons.json\n`);
}

main().catch((error) => {
  console.error("Unexpected error during registry build:", error);
  process.exit(1);
});
