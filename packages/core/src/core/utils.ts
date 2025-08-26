import fs from 'fs';
import path from 'path';

/**
 * Checks if a control file is inside a publishConfig.directory
 */
export function isInPublishConfigDirectory(controlFile: string, packageJsonPath: string): boolean {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const publishDir = packageJson.publishConfig?.directory;
    
    if (!publishDir) {
      return false; // No publishConfig.directory set
    }

    const packageDir = path.dirname(packageJsonPath);
    const fullPublishDir = path.resolve(packageDir, publishDir);
    const fullControlFile = path.resolve(controlFile);

    // Check if control file is inside the publish directory
    return fullControlFile.startsWith(fullPublishDir + path.sep) || fullControlFile === fullPublishDir;
  } catch {
    return false; // Error reading package.json
  }
}

/**
 * Parses .gitignore content into patterns array
 */
export function parseGitignorePatterns(content: string): { pattern: string; negated: boolean }[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')) // Remove empty lines and comments
    .map(line => {
      const negated = line.startsWith('!');
      const pattern = negated ? line.slice(1) : line;
      return { pattern, negated };
    });
}

/**
 * Basic gitignore pattern matching
 */
export function matchesGitignorePatterns(relativePath: string, patterns: { pattern: string; negated: boolean }[]): boolean {
  let ignored = false;

  for (const { pattern, negated } of patterns) {
    if (matchesGitignorePattern(relativePath, pattern)) {
      ignored = !negated; // If negated (!pattern), then not ignored
    }
  }

  return ignored;
}

/**
 * Simple glob pattern matching for gitignore patterns
 */
export function matchesGitignorePattern(path: string, pattern: string): boolean {
  // Handle directory patterns (ending with /)
  if (pattern.endsWith('/')) {
    pattern = pattern.slice(0, -1);
    // For directory patterns, match if path starts with pattern
    return path === pattern || path.startsWith(pattern + '/');
  }

  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*') // ** matches any number of directories
    .replace(/\*/g, '[^/]*') // * matches any characters except /
    .replace(/\?/g, '[^/]') // ? matches any single character except /
    .replace(/\./g, '\\.'); // Escape dots

  const regex = new RegExp(`^${regexPattern}$`);
  
  // Also check if any part of the path matches (for patterns without /)
  if (!pattern.includes('/')) {
    const pathParts = path.split('/');
    return pathParts.some(part => regex.test(part)) || regex.test(path);
  }

  return regex.test(path);
}

/**
 * Checks if a directory is ignored by .gitignore files from current dir up to workspace root
 */
export function isIgnoredByGitignore(targetDir: string, workspacePath: string): boolean {
  if (!workspacePath) return false;

  const workspaceRoot = path.resolve(workspacePath);
  let currentDir = path.resolve(targetDir);

  // Walk up from target directory to workspace root
  while (currentDir.startsWith(workspaceRoot)) {
    const gitignorePath = path.join(currentDir, '.gitignore');
    
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const patterns = parseGitignorePatterns(gitignoreContent);
      
      // Get relative path from current gitignore location to target
      const relativePath = path.relative(currentDir, targetDir);
      
      if (matchesGitignorePatterns(relativePath, patterns)) {
        return true;
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached root
    }
    currentDir = parentDir;
  }

  return false;
}
