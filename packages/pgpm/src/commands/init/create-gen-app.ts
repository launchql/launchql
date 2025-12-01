import path from 'path';
import { CacheManager, GitCloner, Templatizer } from 'create-gen-app';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_TOOL_NAME = 'pgpm';
export const DEFAULT_TEMPLATE_URL = 'https://github.com/launchql/pgpm-boilerplates.git';
export const DEFAULT_TTL = ONE_WEEK_MS;

export interface CreateGenAppOptions {
  templateUrl?: string;
  branch?: string;
  fromPath?: string;
  outputDir: string;
  answers?: Record<string, any>;
  noTty?: boolean;
}

/**
 * Clone (or reuse cached) template repo and render using create-gen-app building blocks.
 */
export async function runCreateGenApp({
  templateUrl = DEFAULT_TEMPLATE_URL,
  branch,
  fromPath,
  outputDir,
  answers = {},
  noTty = false
}: CreateGenAppOptions) {
  const cacheManager = new CacheManager({
    toolName: DEFAULT_TOOL_NAME,
    ttl: DEFAULT_TTL
  });
  const gitCloner = new GitCloner();
  const templatizer = new Templatizer();

  const normalizedUrl = gitCloner.normalizeUrl(templateUrl);
  const cacheKey = cacheManager.createKey(normalizedUrl, branch);

  const cachedPath = cacheManager.get(cacheKey);
  const expiredMetadata = cacheManager.checkExpiration(cacheKey);

  if (expiredMetadata) {
    console.warn(
      `⚠️  Cached template expired (last updated: ${new Date(expiredMetadata.lastUpdated).toLocaleString()})`
    );
    console.log('Updating cache...');
    cacheManager.clear(cacheKey);
  }

  let templateDir: string;

  if (cachedPath && !expiredMetadata) {
    console.log(`Using cached template from ${cachedPath}`);
    templateDir = cachedPath;
  } else {
    console.log(`Cloning template from ${templateUrl}...`);
    const tempDest = path.join(cacheManager.getReposDir(), cacheKey);
    gitCloner.clone(normalizedUrl, tempDest, { branch, depth: 1 });
    cacheManager.set(cacheKey, tempDest);
    templateDir = tempDest;
    console.log('Template cached for future runs');
  }

  const selectionRoot =
    !fromPath || fromPath === '.' ? templateDir : path.join(templateDir, fromPath);

  await templatizer.process(selectionRoot, outputDir, { argv: answers, noTty });

  return { outputDir, cachePath: templateDir };
}

export function clearCreateGenAppCache() {
  const cacheManager = new CacheManager({
    toolName: DEFAULT_TOOL_NAME,
    ttl: DEFAULT_TTL
  });
  cacheManager.clearAll();
}
