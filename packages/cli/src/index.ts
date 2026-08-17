import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GeneratedRegistry, RegistryEntry } from '@trix/registry';

const VERSION = '0.1.0';

// Convert slug (e.g. 'search', 'home') to PascalCase ComponentName (e.g. 'SearchIcon', 'HomeIcon')
function toComponentName(slug: string): string {
  const camel = slug.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return `${camel.charAt(0).toUpperCase()}${camel.slice(1)}Icon`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Locate registry JSON file (bundled in dist/ first)
function loadRegistry(): GeneratedRegistry {
  const possiblePaths = [
    path.resolve(__dirname, './icons.json'),
    path.resolve(__dirname, '../dist/icons.json'),
    path.resolve(__dirname, '../../../registry/icons.json'),
    path.resolve(__dirname, '../../registry/icons.json'),
    path.resolve(process.cwd(), 'node_modules/@trix/registry/dist/icons.json'),
    path.resolve(process.cwd(), 'registry/icons.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw) as GeneratedRegistry;
      } catch {
        // Continue searching fallback paths
      }
    }
  }

  return {
    _generated: true,
    _generatedAt: new Date().toISOString(),
    _generatedBy: 'trix-cli',
    _schema: '1.0.0',
    icons: [],
  };
}

// Locate component source code for an icon (bundled components.json first)
function loadComponentSource(entry: RegistryEntry): string | null {
  const category = entry.category;
  const compName = toComponentName(entry.slug);
  const filename = `${compName}.tsx`;

  // 1. Try bundled components.json in dist/
  const bundledComponentsPaths = [
    path.resolve(__dirname, './components.json'),
    path.resolve(__dirname, '../dist/components.json'),
  ];

  for (const p of bundledComponentsPaths) {
    if (fs.existsSync(p)) {
      try {
        const map = JSON.parse(fs.readFileSync(p, 'utf-8')) as Record<string, string>;
        if (map[compName] || map[entry.slug]) {
          return map[compName] || map[entry.slug] || null;
        }
      } catch {
        // Continue
      }
    }
  }

  // 2. Try relative source files (monorepo mode)
  const possiblePaths = [
    path.resolve(__dirname, `../../icons/src/${category}/${filename}`),
    path.resolve(__dirname, `../../../packages/icons/src/${category}/${filename}`),
    path.resolve(process.cwd(), `packages/icons/src/${category}/${filename}`),
    path.resolve(process.cwd(), `node_modules/@trix/icons/src/${category}/${filename}`),
    path.resolve(process.cwd(), `node_modules/@trix-icons/react/src/${category}/${filename}`),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8');
    }
  }
  return null;
}

function detectTargetDir(customOutput?: string): string {
  if (customOutput) {
    return path.resolve(process.cwd(), customOutput);
  }

  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'src', 'components', 'icons'))) {
    return path.join(cwd, 'src', 'components', 'icons');
  }
  if (fs.existsSync(path.join(cwd, 'components', 'icons'))) {
    return path.join(cwd, 'components', 'icons');
  }
  if (fs.existsSync(path.join(cwd, 'src', 'components'))) {
    return path.join(cwd, 'src', 'components', 'icons');
  }
  if (fs.existsSync(path.join(cwd, 'components'))) {
    return path.join(cwd, 'components', 'icons');
  }
  return path.join(cwd, 'src', 'components', 'icons');
}

function showHelp() {
  console.log(`
Usage: npx trix-icons <command> [options]

Commands:
  add <name...>    Install one or more animated icons into your project
  list             List all available icons in the registry
  search <query>   Search icons by name, category, or keyword
  info <name>      Show metadata, provenance, and animation story for an icon

Options:
  --output <path>  Target directory for installed component files
  --force          Overwrite existing files or install experimental brand icons
  --help           Show command usage and options
  --version        Show CLI version

Examples:
  npx trix-icons add search
  npx trix-icons add bell mail call --output src/ui/icons/
  npx trix-icons list
  npx trix-icons search communication
  npx trix-icons info call
`);
}

function listIcons(registry: GeneratedRegistry) {
  const iconList = registry.icons || [];
  console.log(`\ntrix-icons Registry v${VERSION} (${iconList.length} icons available)\n`);
  
  const grouped: Record<string, RegistryEntry[]> = {};
  for (const icon of iconList) {
    grouped[icon.category] = grouped[icon.category] || [];
    grouped[icon.category]!.push(icon);
  }

  for (const [category, list] of Object.entries(grouped)) {
    console.log(`\x1b[1m${category.toUpperCase()}\x1b[0m`);
    for (const icon of list) {
      const statusBadge = icon.status === 'stable' ? '\x1b[32m[stable]\x1b[0m' : '\x1b[33m[experimental]\x1b[0m';
      console.log(`  • ${icon.slug.padEnd(14)} ${statusBadge} ${icon.description}`);
    }
  }
  console.log(`\nRun 'npx trix-icons add <name>' to install an icon.\n`);
}

function searchIcons(registry: GeneratedRegistry, query: string) {
  if (!query || query.trim().length === 0) {
    console.log(`\nPlease specify a query to search.\nExample: npx trix-icons search communication\n`);
    return;
  }

  const q = query.toLowerCase();
  const iconList = registry.icons || [];
  const matches = iconList.filter(
    (i) =>
      i.slug.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      (i.keywords && i.keywords.some((k: string) => k.toLowerCase().includes(q)))
  );

  if (matches.length === 0) {
    console.log(`\nNo icons found matching "${query}". Run 'npx trix-icons list' to see all icons.\n`);
    return;
  }

  console.log(`\nFound ${matches.length} matching icon(s):\n`);
  for (const icon of matches) {
    console.log(`  • \x1b[1m${icon.slug}\x1b[0m (${icon.category}) — ${icon.description}`);
  }
  console.log(`\nRun 'npx trix-icons add <name>' to install.\n`);
}

function infoIcon(registry: GeneratedRegistry, name: string) {
  if (!name) {
    console.error(`\nError: Please specify an icon name.\nExample: npx trix-icons info call\n`);
    process.exit(1);
    return;
  }

  const iconList = registry.icons || [];
  const icon = iconList.find((i) => i.slug === name.toLowerCase());
  if (!icon) {
    console.error(`\nError: Icon "${name}" was not found in registry.\n\nRun:\n  npx trix-icons list\n  npx trix-icons search <query>\n`);
    process.exit(1);
    return;
  }

  console.log(`
\x1b[1mIcon: ${icon.name} (${icon.slug})\x1b[0m
Category:      ${icon.category}
Status:        ${icon.status}
Version:       ${icon.version}
Description:   ${icon.description}
Keywords:      ${(icon.keywords || []).join(', ')}

\x1b[1mAnimation Details:\x1b[0m
Technique:     ${icon.animation?.technique || 'standard'}
Story:         ${icon.animation?.description || 'Semantic story animation'}
Reduced Motion: ${icon.animation?.reducedMotion || 'static'}

\x1b[1mProvenance Details:\x1b[0m
Source:        ${icon.provenance?.source || 'original'}
License:       ${icon.provenance?.license || 'MIT'}
Trademark:     ${icon.provenance?.trademark ? 'Yes' : 'No'}
${icon.provenance?.trademarkOwner ? `Trademark Owner: ${icon.provenance.trademarkOwner}` : ''}
${icon.provenance?.attribution ? `Attribution:   ${icon.provenance.attribution}` : ''}

To install:
  npx trix-icons add ${icon.slug}
`);
}

function addIcons(registry: GeneratedRegistry, names: string[], customOutput?: string, force = false) {
  if (names.length === 0) {
    console.error(`\nError: Please specify at least one icon name to add.\nExample: npx trix-icons add search\n`);
    process.exit(1);
    return;
  }

  const targetDir = detectTargetDir(customOutput);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const installed: string[] = [];
  const iconList = registry.icons || [];

  for (const name of names) {
    const slug = name.toLowerCase();
    const entry = iconList.find((i) => i.slug === slug);

    if (!entry) {
      console.error(`\nError: Icon "${name}" was not found in registry.\n\nRun:\n  npx trix-icons list\n  npx trix-icons search <query>\n`);
      continue;
    }

    // Experimental Brand Icon Provenance Guard
    if ((entry.status === 'experimental' && entry.category === 'brands') || entry.provenance?.reviewRequired) {
      if (!force) {
        console.log(`\nWarning: Icon "${entry.slug}" is experimental with unresolved brand provenance.`);
        console.log(`  License status:  ${entry.provenance?.license || 'unknown'}`);
        console.log(`  Trademark owner: ${entry.provenance?.trademarkOwner || 'Third party'}`);
        console.log(`  Verify permissions before proceeding.`);
        console.log(`  Use '--force' to install: npx trix-icons add ${entry.slug} --force\n`);
        continue;
      } else {
        console.log(`\x1b[33mNotice: Installing experimental brand icon "${entry.slug}" with --force flag.\x1b[0m`);
      }
    }

    const compName = toComponentName(entry.slug);
    const sourceCode = loadComponentSource(entry);
    if (!sourceCode) {
      console.error(`\nError: Could not locate component source code for "${entry.slug}".\n`);
      continue;
    }

    const targetFile = path.join(targetDir, `${compName}.tsx`);

    if (fs.existsSync(targetFile) && !force) {
      console.log(`\nWarning: ${compName}.tsx already exists in ${path.relative(process.cwd(), targetDir)}.`);
      console.log(`  Use '--force' to overwrite: npx trix-icons add ${entry.slug} --force\n`);
      continue;
    }

    fs.writeFileSync(targetFile, sourceCode, 'utf-8');
    const relativeTarget = path.relative(process.cwd(), targetFile);
    console.log(`✓ Added ${compName}.tsx → ${relativeTarget}`);
    installed.push(compName);
  }

  if (installed.length > 0) {
    console.log(`
Installed components require peer dependency:
  motion (framer-motion / motion/react)

Install with:
  npm install motion
`);
  }
}

export function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`trix-icons CLI v${VERSION}`);
    return;
  }

  const registry = loadRegistry();

  let customOutput: string | undefined;
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    customOutput = args[outputIdx + 1];
  }

  const force = args.includes('--force');

  // Filter out flags from command arguments
  const cleanArgs = args.filter((arg: string, i: number) => {
    if (arg.startsWith('--')) return false;
    if (i > 0 && args[i - 1] === '--output') return false;
    return true;
  });

  const command = cleanArgs[0];
  const commandArgs = cleanArgs.slice(1);

  switch (command) {
    case 'add':
      addIcons(registry, commandArgs, customOutput, force);
      break;
    case 'list':
      listIcons(registry);
      break;
    case 'search':
      searchIcons(registry, commandArgs.join(' '));
      break;
    case 'info':
      infoIcon(registry, commandArgs[0] || '');
      break;
    default:
      console.error(`\nError: Unknown command "${command}". Run 'npx trix-icons --help' for usage.\n`);
      process.exit(1);
  }
}

main();
