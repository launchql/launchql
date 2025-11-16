import { getGitConfigInfo } from '@launchql/types';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Pattern-based seed providers for common variable types
 * These provide intelligent defaults without hardcoding specific variable names
 */

/**
 * Get GitHub username from git remote origin URL
 * @returns GitHub username or null if not found
 */
function getGitHubUsernameFromRemote(): string | null {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Sanitize a string to be used as a username (lowercase, alphanumeric + hyphens)
 */
function sanitizeUsername(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate seed values for variables based on pattern matching
 * @param varNames - Set of variable names to generate seeds for
 * @param cwd - Current working directory
 * @returns Object with seed values
 */
export function generateSeedValues(
  varNames: Set<string>,
  cwd: string = process.cwd()
): Record<string, any> {
  const seeds: Record<string, any> = {};
  
  let gitInfo: { username: string; email: string } | null = null;
  let githubUsername: string | null = null;
  
  try {
    gitInfo = getGitConfigInfo();
  } catch {
  }
  
  for (const varName of varNames) {
    const upperName = varName.toUpperCase();
    
    if (upperName.includes('EMAIL') && gitInfo) {
      seeds[varName] = gitInfo.email;
      continue;
    }
    
    if ((upperName.includes('USERFULLNAME') || upperName.includes('FULLNAME') || upperName.includes('AUTHOR')) && gitInfo) {
      seeds[varName] = gitInfo.username;
      continue;
    }
    
    if (upperName.includes('USERNAME')) {
      if (!githubUsername) {
        githubUsername = getGitHubUsernameFromRemote();
        if (!githubUsername && gitInfo) {
          githubUsername = sanitizeUsername(gitInfo.username);
        }
      }
      if (githubUsername) {
        seeds[varName] = githubUsername;
      }
      continue;
    }
    
    if (upperName.includes('MODULENAME') || upperName === 'NAME') {
      const dirName = path.basename(cwd);
      seeds[varName] = dirName;
      continue;
    }
    
    if (upperName.includes('REPONAME') || upperName.includes('REPO')) {
      const dirName = path.basename(cwd);
      seeds[varName] = dirName;
      continue;
    }
    
    if (upperName.includes('PACKAGE') && upperName.includes('IDENTIFIER')) {
      if (!githubUsername) {
        githubUsername = getGitHubUsernameFromRemote();
        if (!githubUsername && gitInfo) {
          githubUsername = sanitizeUsername(gitInfo.username);
        }
      }
      
      const dirName = path.basename(cwd);
      if (githubUsername) {
        seeds[varName] = `@${githubUsername}/${dirName}`;
      } else {
        seeds[varName] = dirName;
      }
      continue;
    }
    
    if (upperName.includes('MODULEDESC') || upperName.includes('DESCRIPTION')) {
      const dirName = path.basename(cwd);
      seeds[varName] = `${dirName} module`;
      continue;
    }
    
    if (upperName.includes('ACCESS')) {
      seeds[varName] = 'public';
      continue;
    }
  }
  
  return seeds;
}

/**
 * Merge seed values with provided values, preferring provided values
 * @param seeds - Seed values generated from patterns
 * @param provided - Values provided by user or CLI
 * @returns Merged values
 */
export function mergeSeedValues(
  seeds: Record<string, any>,
  provided: Record<string, any>
): Record<string, any> {
  return {
    ...seeds,
    ...provided
  };
}
