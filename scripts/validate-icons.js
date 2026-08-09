#!/usr/bin/env node
/**
 * scripts/validate-icons.js
 *
 * Validates the structure and metadata of all icons in icons/.
 * This script must be run before building the registry.
 *
 * Usage: node scripts/validate-icons.js
 *
 * Exits with code 1 if any validation errors are found.
 * Prints all errors before exiting — does not stop at the first error.
 */

import { readdir, readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { constants } from "node:fs";

const ROOT = resolve(import.meta.dirname, "..");
const ICONS_DIR = join(ROOT, "icons");

const VALID_CATEGORIES = ["ui", "actions", "navigation", "communication", "media", "system", "brands", "experimental"];
const VALID_STATUSES = ["stable", "experimental", "deprecated"];
const VALID_PROVENANCE_SOURCES = ["original", "modified-third-party", "third-party"];
const VALID_REDUCED_MOTION = ["static", "minimal", "essential"];

/**
 * Checks if a file exists without throwing.
 */
async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and parses a JSON file.
 * Throws a descriptive error if it cannot be read or parsed.
 */
async function readJsonFile(path) {
  let content;
  try {
    content = await readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`Cannot read file "${path}": ${error.message}`);
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in "${path}": ${error.message}`);
  }
}

/**
 * Validates a single icon directory.
 * Returns an array of error strings (empty means valid).
 */
async function validateIcon(category, name) {
  const iconDir = join(ICONS_DIR, category, name);
  const source = `icons/${category}/${name}`;
  const errors = [];
  const warnings = [];

  // Check required files exist
  const svgPath = join(iconDir, "icon.svg");
  const metaPath = join(iconDir, "meta.json");

  const [svgExists, metaExists] = await Promise.all([
    fileExists(svgPath),
    fileExists(metaPath),
  ]);

  if (!svgExists) {
    errors.push(`${source}: missing required file "icon.svg"`);
  }

  if (!metaExists) {
    errors.push(`${source}: missing required file "meta.json"`);
    // Cannot continue without meta.json
    return { errors, warnings };
  }

  // Validate meta.json
  let meta;
  try {
    meta = await readJsonFile(metaPath);
  } catch (error) {
    errors.push(`${source}: ${error.message}`);
    return { errors, warnings };
  }

  // Required string fields
  const requiredStrings = ["name", "slug", "category", "description", "version"];
  for (const field of requiredStrings) {
    if (typeof meta[field] !== "string" || meta[field].trim() === "") {
      errors.push(`${source}: "${field}" must be a non-empty string`);
    }
  }

  // name must match directory name
  if (typeof meta.name === "string" && meta.name !== name) {
    errors.push(`${source}: "name" field ("${meta.name}") must match directory name ("${name}")`);
  }

  // category must match parent directory
  if (typeof meta.category === "string" && meta.category !== category) {
    errors.push(`${source}: "category" field ("${meta.category}") must match parent directory ("${category}")`);
  }

  // Valid category
  if (typeof meta.category === "string" && !VALID_CATEGORIES.includes(meta.category)) {
    errors.push(`${source}: "${meta.category}" is not a valid category. Valid: ${VALID_CATEGORIES.join(", ")}`);
  }

  // Valid status
  if (!VALID_STATUSES.includes(meta.status)) {
    errors.push(`${source}: "status" must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  // Slug format
  if (typeof meta.slug === "string" && !/^[a-z0-9-]+$/.test(meta.slug)) {
    errors.push(`${source}: "slug" must be lowercase alphanumeric with hyphens only. Got: "${meta.slug}"`);
  }

  // Keywords
  if (!Array.isArray(meta.keywords) || meta.keywords.length < 2) {
    warnings.push(`${source}: "keywords" should have at least 2 entries for searchability`);
  }

  // Provenance
  if (typeof meta.provenance !== "object" || meta.provenance === null) {
    errors.push(`${source}: "provenance" object is required`);
  } else {
    const p = meta.provenance;

    if (!VALID_PROVENANCE_SOURCES.includes(p.source)) {
      errors.push(`${source}: "provenance.source" must be one of: ${VALID_PROVENANCE_SOURCES.join(", ")}`);
    }

    if (typeof p.license !== "string" || p.license.trim() === "") {
      errors.push(`${source}: "provenance.license" must be a non-empty string (use "unknown" if not verified)`);
    }

    if (typeof p.trademark !== "boolean") {
      errors.push(`${source}: "provenance.trademark" must be a boolean`);
    }

    if (p.trademark === true && (typeof p.trademarkOwner !== "string" || p.trademarkOwner.trim() === "")) {
      errors.push(`${source}: "provenance.trademarkOwner" is required when trademark is true`);
    }

    if (p.source === "modified-third-party") {
      if (typeof p.originalSource !== "string" || p.originalSource.trim() === "") {
        errors.push(`${source}: "provenance.originalSource" is required when source is "modified-third-party"`);
      }
      if (typeof p.originalLicense !== "string" || p.originalLicense.trim() === "") {
        errors.push(`${source}: "provenance.originalLicense" is required when source is "modified-third-party"`);
      }
    }
  }

  // Animation
  if (typeof meta.animation !== "object" || meta.animation === null) {
    errors.push(`${source}: "animation" object is required`);
  } else {
    const a = meta.animation;

    if (typeof a.technique !== "string" || a.technique.trim() === "") {
      errors.push(`${source}: "animation.technique" must be a non-empty string`);
    }

    if (typeof a.description !== "string" || a.description.trim() === "") {
      errors.push(`${source}: "animation.description" must be a non-empty string`);
    }

    if (!VALID_REDUCED_MOTION.includes(a.reducedMotion)) {
      errors.push(`${source}: "animation.reducedMotion" must be one of: ${VALID_REDUCED_MOTION.join(", ")}`);
    }
  }

  // Accessibility
  if (typeof meta.accessibility !== "object" || meta.accessibility === null) {
    errors.push(`${source}: "accessibility" object is required`);
  } else {
    const a = meta.accessibility;
    if (typeof a.defaultLabel !== "string" || a.defaultLabel.trim() === "") {
      errors.push(`${source}: "accessibility.defaultLabel" must be a non-empty string`);
    }
  }

  // Stable gate
  if (meta.status === "stable") {
    if (meta.provenance?.reviewRequired === true) {
      errors.push(`${source}: Cannot set status "stable" when provenance.reviewRequired is true`);
    }
    if (meta.provenance?.license === "unknown") {
      errors.push(`${source}: Cannot set status "stable" when provenance.license is "unknown"`);
    }
  }

  // SVG validation (basic checks if the file exists)
  if (svgExists) {
    let svgContent;
    try {
      svgContent = await readFile(svgPath, "utf-8");
    } catch (error) {
      errors.push(`${source}: Cannot read "icon.svg": ${error.message}`);
    }

    if (svgContent) {
      if (!svgContent.includes("viewBox")) {
        errors.push(`${source}: "icon.svg" must have a viewBox attribute`);
      }

      // Check for hardcoded colors (simple heuristic)
      const colorPattern = /#[0-9a-fA-F]{3,6}|color\s*:\s*(?!currentColor)[a-zA-Z]+|fill\s*=\s*"(?!none|currentColor)[^"]+"|stroke\s*=\s*"(?!none|currentColor)[^"]+"/;
      if (colorPattern.test(svgContent) && !svgContent.includes("currentColor") && !svgContent.includes("brands")) {
        warnings.push(`${source}: "icon.svg" may contain hardcoded colors. UI icons should use currentColor.`);
      }

      // Check for width/height on root svg
      const rootSvgPattern = /<svg[^>]*(?:width|height)=["'][^"']*["'][^>]*>/;
      if (rootSvgPattern.test(svgContent)) {
        warnings.push(`${source}: "icon.svg" root <svg> should not have width or height attributes — these are set via the size prop.`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * Main validation runner.
 */
async function main() {
  console.log("Validating icon sources...\n");

  let categories;
  try {
    categories = await readdir(ICONS_DIR, { withFileTypes: true });
  } catch (error) {
    console.error(`Error reading icons directory: ${error.message}`);
    process.exit(1);
  }

  const allErrors = [];
  const allWarnings = [];
  let iconCount = 0;

  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) continue;
    const category = categoryEntry.name;

    if (!VALID_CATEGORIES.includes(category)) {
      allWarnings.push(`icons/${category}: unknown category directory (valid: ${VALID_CATEGORIES.join(", ")})`);
      continue;
    }

    let icons;
    try {
      icons = await readdir(join(ICONS_DIR, category), { withFileTypes: true });
    } catch (error) {
      allErrors.push(`icons/${category}: Cannot read directory: ${error.message}`);
      continue;
    }

    for (const iconEntry of icons) {
      if (!iconEntry.isDirectory()) continue;

      iconCount++;
      const { errors, warnings } = await validateIcon(category, iconEntry.name);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
    }
  }

  // Print results
  if (allWarnings.length > 0) {
    console.log("Warnings:");
    for (const warning of allWarnings) {
      console.log(`  ⚠ ${warning}`);
    }
    console.log();
  }

  if (allErrors.length > 0) {
    console.log("Errors:");
    for (const error of allErrors) {
      console.error(`  ✗ ${error}`);
    }
    console.log();
    console.error(`Validation failed: ${allErrors.length} error(s) in ${iconCount} icon(s).`);
    process.exit(1);
  }

  if (iconCount === 0) {
    console.log("No icons found. Add icons to icons/<category>/<name>/ to get started.");
    console.log("See ICON_AUTHORING.md for the process.\n");
    process.exit(0);
  }

  console.log(`✓ ${iconCount} icon(s) validated successfully.\n`);
}

main().catch((error) => {
  console.error("Unexpected error during validation:", error);
  process.exit(1);
});
