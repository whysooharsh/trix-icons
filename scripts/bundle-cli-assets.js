import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const registryPath = path.resolve(repoRoot, 'registry/icons.json');
const iconsSrcDir = path.resolve(repoRoot, 'packages/icons/src');

const targets = [
  path.resolve(repoRoot, 'dist'),
  path.resolve(repoRoot, 'packages/cli/dist'),
];

for (const targetDir of targets) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Copy registry/icons.json
  if (fs.existsSync(registryPath)) {
    fs.copyFileSync(registryPath, path.join(targetDir, 'icons.json'));
  }
}

// 2. Scan component sources
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

const jsonContent = JSON.stringify(componentMap, null, 2);

for (const targetDir of targets) {
  fs.writeFileSync(path.join(targetDir, 'components.json'), jsonContent, 'utf-8');
}

console.log(`✓ CLI runtime assets bundled to dist/ (${Object.keys(componentMap).length / 2} components)`);
