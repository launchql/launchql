import fs from 'fs';
import os from 'os';
import path from 'path';
import { CacheManager, GitCloner, Templatizer } from 'create-gen-app';

import { BoilerplateQuestion } from './boilerplate-types';
import {
  readBoilerplateConfig,
  readBoilerplatesConfig,
  resolveBoilerplateBaseDir,
} from './boilerplate-scanner';

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
  /** Override the boilerplate directory (e.g., "default", "supabase") */
  dir?: string;
}

export interface ScaffoldTemplateResult {
  cacheUsed: boolean;
  cacheExpired: boolean;
  cachePath?: string;
  templateDir: string;
  /** Questions loaded from .boilerplate.json, if any */
  questions?: BoilerplateQuestion[];
}

export const DEFAULT_TEMPLATE_REPO =
  'https://github.com/constructive-io/pgpm-boilerplates.git';
export const DEFAULT_TEMPLATE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
export const DEFAULT_TEMPLATE_TOOL_NAME = 'pgpm';

const templatizer = new Templatizer();

const looksLikePath = (value: string): boolean => {
  return (
    value.startsWith('.') || value.startsWith('/') || value.startsWith('~')
  );
};

const normalizeQuestions = (questions?: BoilerplateQuestion[]) =>
  questions?.map((q) => ({
    ...q,
    type: q.type || 'text',
  }));

const attachQuestionsToTemplatizer = (
  templ: any,
  questions?: BoilerplateQuestion[]
) => {
  if (!questions?.length || typeof templ?.extract !== 'function') return;
  const originalExtract = templ.extract.bind(templ);
  templ.extract = async (templateDir: string) => {
    const extracted = await originalExtract(templateDir);
    extracted.projectQuestions = {
      questions: normalizeQuestions(questions),
    };
    return extracted;
  };
};

/**
 * Resolve the template path using the new metadata-driven resolution.
 *
 * Resolution order:
 * 1. If explicit `templatePath` is provided, use it directly
 * 2. If `.boilerplates.json` exists, use its `dir` field to find the base directory
 * 3. Look for `{baseDir}/{type}` (e.g., "default/module")
 * 4. Fallback to legacy structure: `{type}` directly in root
 */
const resolveFromPath = (
  templateDir: string,
  templatePath: string | undefined,
  type: TemplateKind,
  dirOverride?: string
): { fromPath: string; resolvedTemplatePath: string } => {
  // If explicit templatePath is provided, use it directly
  if (templatePath) {
    const candidateDir = path.isAbsolute(templatePath)
      ? templatePath
      : path.join(templateDir, templatePath);
    if (
      fs.existsSync(candidateDir) &&
      fs.statSync(candidateDir).isDirectory()
    ) {
      return {
        fromPath: path.relative(templateDir, candidateDir) || '.',
        resolvedTemplatePath: candidateDir,
      };
    }
    return {
      fromPath: templatePath,
      resolvedTemplatePath: path.join(templateDir, templatePath),
    };
  }

  // Try new metadata-driven resolution
  const rootConfig = readBoilerplatesConfig(templateDir);
  const baseDir = dirOverride ?? rootConfig?.dir;

  if (baseDir) {
    // New structure: {templateDir}/{baseDir}/{type}
    const newStructurePath = path.join(templateDir, baseDir, type);
    if (
      fs.existsSync(newStructurePath) &&
      fs.statSync(newStructurePath).isDirectory()
    ) {
      return {
        fromPath: path.join(baseDir, type),
        resolvedTemplatePath: newStructurePath,
      };
    }
  }

  // Fallback to legacy structure: {templateDir}/{type}
  const legacyPath = path.join(templateDir, type);
  if (fs.existsSync(legacyPath) && fs.statSync(legacyPath).isDirectory()) {
    return {
      fromPath: type,
      resolvedTemplatePath: legacyPath,
    };
  }

  // Default fallback
  return {
    fromPath: type,
    resolvedTemplatePath: path.join(templateDir, type),
  };
};

export async function scaffoldTemplate(
  options: ScaffoldTemplateOptions
): Promise<ScaffoldTemplateResult> {
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
    cacheBaseDir,
    dir,
  } = options;

  const resolvedRepo = looksLikePath(templateRepo)
    ? path.resolve(cwd ?? process.cwd(), templateRepo)
    : templateRepo;

  // Handle local template directories without caching
  if (
    looksLikePath(templateRepo) &&
    fs.existsSync(resolvedRepo) &&
    fs.statSync(resolvedRepo).isDirectory()
  ) {
    const { fromPath, resolvedTemplatePath } = resolveFromPath(
      resolvedRepo,
      templatePath,
      type,
      dir
    );

    // Read boilerplate config for questions
    const boilerplateConfig = readBoilerplateConfig(resolvedTemplatePath);

    // Inject questions into the templatizer pipeline so prompt types and defaults are applied
    attachQuestionsToTemplatizer(templatizer, boilerplateConfig?.questions);

    await templatizer.process(resolvedRepo, outputDir, {
      argv: answers,
      noTty,
      fromPath,
    } as any);

    return {
      cacheUsed: false,
      cacheExpired: false,
      templateDir: resolvedRepo,
      questions: boilerplateConfig?.questions,
    };
  }

  // Remote repo with caching
  const cacheManager = new CacheManager({
    toolName,
    ttl: cacheTtlMs,
    baseDir:
      cacheBaseDir ??
      process.env.PGPM_CACHE_BASE_DIR ??
      (process.env.JEST_WORKER_ID
        ? path.join(os.tmpdir(), `pgpm-cache-${process.env.JEST_WORKER_ID}`)
        : undefined),
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
  if (cachedPath && !expiredMetadata) {
    templateDir = cachedPath;
    cacheUsed = true;
  } else {
    const tempDest = path.join(cacheManager.getReposDir(), cacheKey);
    gitCloner.clone(normalizedUrl, tempDest, {
      branch,
      depth: 1,
      singleBranch: true,
    });
    cacheManager.set(cacheKey, tempDest);
    templateDir = tempDest;
  }

  const { fromPath, resolvedTemplatePath } = resolveFromPath(
    templateDir,
    templatePath,
    type,
    dir
  );

  // Read boilerplate config for questions
  const boilerplateConfig = readBoilerplateConfig(resolvedTemplatePath);

  // Inject questions into the templatizer pipeline so prompt types and defaults are applied
  attachQuestionsToTemplatizer(templatizer, boilerplateConfig?.questions);

  await templatizer.process(templateDir, outputDir, {
    argv: answers,
    noTty,
    fromPath,
  } as any);

  return {
    cacheUsed,
    cacheExpired: Boolean(expiredMetadata),
    cachePath: templateDir,
    templateDir,
    questions: boilerplateConfig?.questions,
  };
}
