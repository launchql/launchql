import fs from 'fs';
import os from 'os';
import path from 'path';
import { CacheManager, GitCloner, Templatizer } from 'create-gen-app';

export type TemplateKind = 'workspace' | 'module';

export interface ScaffoldTemplateOptions {
  type: TemplateKind;
  outputDir: string;
  templateRepo?: string;
  branch?: string;
  templatePath?: string;
  answers: Record<string, any>;
  noTty?: boolean;
  cacheTtlMs?: number;
  toolName?: string;
  cwd?: string;
  cacheBaseDir?: string;
}

export interface ScaffoldTemplateResult {
  cacheUsed: boolean;
  cacheExpired: boolean;
  cachePath?: string;
  templateDir: string;
}

export const DEFAULT_TEMPLATE_REPO = 'https://github.com/launchql/pgpm-boilerplates.git';
export const DEFAULT_TEMPLATE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
export const DEFAULT_TEMPLATE_TOOL_NAME = 'pgpm';

const templatizer = new Templatizer();

const looksLikePath = (value: string): boolean => {
  return value.startsWith('.') || value.startsWith('/') || value.startsWith('~');
};

const resolveFromPath = (templateDir: string, templatePath: string | undefined, type: TemplateKind): string => {
  const candidate = templatePath ?? type;
  // If the candidate already points to an existing directory, use it directly,
  // otherwise fall back to the template kind (module/workspace).
  const candidateDir = path.isAbsolute(candidate) ? candidate : path.join(templateDir, candidate);
  if (fs.existsSync(candidateDir) && fs.statSync(candidateDir).isDirectory()) {
    return path.relative(templateDir, candidateDir) || '.';
  }
  return templatePath ?? type;
};

const isValidTemplateRepo = (templateRoot: string, type: TemplateKind): boolean => {
  try {
    const templateDir = path.join(templateRoot, type);
    if (!fs.existsSync(templateDir) || !fs.statSync(templateDir).isDirectory()) {
      return false;
    }

    const requiredFiles =
      type === 'workspace'
        ? ['pgpm.json', 'package.json']
        : ['pgpm.plan', 'package.json'];

    return requiredFiles.every(file => fs.existsSync(path.join(templateDir, file)));
  } catch {
    return false;
  }
};

export async function scaffoldTemplate(options: ScaffoldTemplateOptions): Promise<ScaffoldTemplateResult> {
  const {
    type,
    outputDir,
    templateRepo = DEFAULT_TEMPLATE_REPO,
    branch,
    templatePath,
    answers,
  noTty = false,
  cacheTtlMs = DEFAULT_TEMPLATE_TTL_MS,
  toolName = DEFAULT_TEMPLATE_TOOL_NAME,
  cwd,
  cacheBaseDir
} = options;

  const resolvedRepo = looksLikePath(templateRepo)
    ? path.resolve(cwd ?? process.cwd(), templateRepo)
    : templateRepo;

  // Handle local template directories without caching
  if (looksLikePath(templateRepo) && fs.existsSync(resolvedRepo) && fs.statSync(resolvedRepo).isDirectory()) {
    const fromPath = resolveFromPath(resolvedRepo, templatePath, type);
    await templatizer.process(resolvedRepo, outputDir, {
      argv: answers,
      noTty,
      fromPath
    });

    return {
      cacheUsed: false,
      cacheExpired: false,
      templateDir: resolvedRepo
    };
  }

  // Remote repo with caching
  const cacheManager = new CacheManager({
    toolName,
    ttl: cacheTtlMs,
    baseDir:
      cacheBaseDir ??
      process.env.PGPM_CACHE_BASE_DIR ??
      (process.env.JEST_WORKER_ID ? path.join(os.tmpdir(), `pgpm-cache-${process.env.JEST_WORKER_ID}`) : undefined)
  });

  const gitCloner = new GitCloner();
  const normalizedUrl = gitCloner.normalizeUrl(resolvedRepo);
  const cacheKey = cacheManager.createKey(normalizedUrl, branch);

  const expiredMetadata = cacheManager.checkExpiration(cacheKey);
  if (expiredMetadata) {
    cacheManager.clear(cacheKey);
  }

  let templateDir: string;
  let cacheUsed = false;
  const cachedPath = cacheManager.get(cacheKey);

  const hasValidCache = cachedPath && !expiredMetadata && isValidTemplateRepo(cachedPath, type);

  if (hasValidCache) {
    templateDir = cachedPath;
    cacheUsed = true;
  } else {
    if (cachedPath && !expiredMetadata && !isValidTemplateRepo(cachedPath, type)) {
      cacheManager.clear(cacheKey);
    }

    const tempDest = path.join(cacheManager.getReposDir(), cacheKey);
    gitCloner.clone(normalizedUrl, tempDest, {
      branch,
      depth: 1,
      singleBranch: true
    });
    cacheManager.set(cacheKey, tempDest);
    templateDir = tempDest;
  }

  const fromPath = resolveFromPath(templateDir, templatePath, type);

  await templatizer.process(templateDir, outputDir, {
    argv: answers,
    noTty,
    fromPath
  });

  return {
    cacheUsed,
    cacheExpired: Boolean(expiredMetadata),
    cachePath: templateDir,
    templateDir
  };
}
