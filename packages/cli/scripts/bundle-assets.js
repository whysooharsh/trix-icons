import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(cliRoot, '../..');

const registryPath = path.resolve(repoRoot, 'registry/icons.json');
const iconsSrcDir = path.resolve(repoRoot, 'packages/icons/src');
const distDir = path.resolve(cliRoot, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Bundle registry/icons.json
if (fs.existsSync(registryPath)) {
  fs.copyFileSync(registryPath, path.join(distDir, 'icons.json'));
}

// 2. Bundle component sources
const componentMap = {};

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      const compName = entry.name.replace(/\.tsx$/, '');
      const content = fs.readFileSync(fullPath, 'utf-8');
      componentMap[compName] = content;
      componentMap[compName.toLowerCase()] = content;
    }
  }
}

scanDir(iconsSrcDir);

fs.writeFileSync(
  path.join(distDir, 'components.json'),
  JSON.stringify(componentMap, null, 2),
  'utf-8'
);

console.log(`✓ CLI assets bundled to ${distDir} (${Object.keys(componentMap).length / 2} components)`);
