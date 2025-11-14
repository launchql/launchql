import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

// need to search due to the dist/ folder and src/, etc.
function findPackageJson(currentDir: string): any {
  const filePath = join(currentDir, 'package.json');

  // Check if package.json exists in the current directory
  if (existsSync(filePath)) {
    return filePath;
  }

  // Get the parent directory
  const parentDir = dirname(currentDir);

  // If reached the root directory, package.json is not found
  if (parentDir === currentDir) {
    throw new Error('package.json not found in any parent directory');
  }

  // Recursively look in the parent directory
  return findPackageJson(parentDir);
}

export function readAndParsePackageJson() {
  const distPkgPath = join(__dirname, 'package.json');
  if (existsSync(distPkgPath)) {
    const str = readFileSync(distPkgPath, 'utf8');
    return JSON.parse(str);
  }

  // Fallback: search upward from current directory
  const pkgPath = findPackageJson(__dirname);
  const str = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(str);
  return pkg;
}
