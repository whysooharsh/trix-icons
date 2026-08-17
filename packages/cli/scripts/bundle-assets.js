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

const CORE_INLINES = `
export interface AnimatedIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  trigger?: 'hover' | 'press' | 'focus' | 'manual' | 'none';
  disabled?: boolean;
  'aria-label'?: string;
}

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;
const EASE_DRAW = [0.65, 0, 0.35, 1] as const;
const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;
const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;
`;

function transformForDistribution(code) {
  let cleaned = code;
  cleaned = cleaned.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"]@trix\/core['"];?\r?\n?/g, '');
  cleaned = cleaned.replace(/import\s+\{[^}]*\}\s+from\s+['"]@trix\/core['"];?\r?\n?/g, '');
  
  const lastImportIndex = Math.max(
    cleaned.lastIndexOf("from 'motion/react';"),
    cleaned.lastIndexOf("from 'react';")
  );

  if (lastImportIndex !== -1) {
    const endOfLineIndex = cleaned.indexOf('\n', lastImportIndex);
    const insertPos = endOfLineIndex !== -1 ? endOfLineIndex + 1 : lastImportIndex;
    cleaned = cleaned.slice(0, insertPos) + '\n' + CORE_INLINES.trim() + '\n\n' + cleaned.slice(insertPos);
  } else {
    cleaned = CORE_INLINES.trim() + '\n\n' + cleaned;
  }
  
  return cleaned;
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
      const rawContent = fs.readFileSync(fullPath, 'utf-8');
      const transformed = transformForDistribution(rawContent);
      componentMap[compName] = transformed;
      componentMap[compName.toLowerCase()] = transformed;
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
