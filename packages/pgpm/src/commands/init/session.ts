import { Logger } from '@launchql/logger';
import {
  extractVarNamesFromDir,
  loadQuestions,
  loadTemplates,
  moduleTemplate,
  Question,
  renderStrict,
  type TemplateSource,
  validateRequiredVars,
  workspaceTemplate
} from '@launchql/templatizer';
import { Inquirerer, Question as InquirerQuestion } from 'inquirerer';
import path from 'path';
import { generateSeedValues, mergeSeedValues } from '../../utils/seedProviders';

const log = new Logger('init-session');

export interface InitSessionOptions {
  /** Type of initialization: 'module' or 'workspace' */
  type: 'module' | 'workspace';
  /** Command-line arguments */
  argv: Partial<Record<string, any>>;
  /** Inquirer instance for prompting */
  prompter: Inquirerer;
  /** Current working directory */
  cwd?: string;
  /** Additional questions to merge with discovered ones */
  additionalQuestions?: InquirerQuestion[];
}

export interface InitSessionResult {
  /** Resolved variables */
  vars: Record<string, any>;
  /** Target directory where files were written */
  targetDir: string;
  /** Whether this was a dry run */
  dryRun: boolean;
}

/**
 * Build and execute an initialization session
 * This is the unified entry point for both module and workspace initialization
 */
export async function buildInitSession(
  options: InitSessionOptions
): Promise<InitSessionResult> {
  const { type, argv, prompter, additionalQuestions = [] } = options;
  const cwd = options.cwd || argv.cwd || process.cwd();
  
  const dryRun = argv.dryRun || false;
  const showVars = argv.showVars || false;
  const strict = argv.strict !== false;
  const verbose = argv.verbose || showVars || dryRun;
  
  log.info(`Starting ${type} initialization session`);
  
  if (dryRun) {
    log.info('DRY RUN MODE: No files will be written');
  }
  
  let templateDir: string | undefined;
  let templates: any[];
  
  if (argv.repo || argv.templatePath) {
    const source: TemplateSource = argv.repo
      ? {
          type: 'github',
          path: argv.repo as string,
          branch: argv.fromBranch as string
        }
      : {
          type: 'local',
          path: argv.templatePath as string
        };
    
    log.info(`Loading templates from ${source.type}: ${source.path}`);
    
    const compiledTemplates = loadTemplates(source, type);
    templates = compiledTemplates.map((t: any) => t.render);
    
    templateDir = source.type === 'local' 
      ? path.resolve(source.path)
      : undefined;
  } else {
    log.info('Using default built-in templates');
    templates = type === 'module' ? moduleTemplate : workspaceTemplate;
    
    const boilerplatesPath = path.join(__dirname, '../../../../../boilerplates');
    templateDir = path.join(boilerplatesPath, type);
  }
  
  let discoveredVars = new Set<string>();
  let questionsFromFile: Question[] = [];
  
  if (templateDir) {
    log.info(`Discovering variables from template directory: ${templateDir}`);
    discoveredVars = extractVarNamesFromDir(templateDir);
    log.info(`Discovered ${discoveredVars.size} variable(s): ${Array.from(discoveredVars).join(', ')}`);
    
    questionsFromFile = loadQuestions(templateDir);
    if (questionsFromFile.length > 0) {
      log.info(`Loaded ${questionsFromFile.length} question(s) from .questions.json`);
    }
  } else {
    log.warn('Template directory not available, skipping variable discovery');
  }
  
  const allVarNames = new Set([
    ...discoveredVars,
    ...questionsFromFile.map(q => q.name)
  ]);
  
  const seedValues = generateSeedValues(allVarNames, cwd);
  if (verbose) {
    log.info('Generated seed values:');
    Object.entries(seedValues).forEach(([key, value]) => {
      log.info(`  ${key}: ${value}`);
    });
  }
  
  const questionMap = new Map<string, Question>();
  questionsFromFile.forEach(q => questionMap.set(q.name, q));
  
  const questions: InquirerQuestion[] = [];
  
  for (const varName of allVarNames) {
    if (questionMap.has(varName)) {
      const q = questionMap.get(varName)!;
      questions.push({
        name: varName,
        message: q.message || `Enter ${varName}`,
        type: q.type || 'text',
        required: q.required !== false,
        default: seedValues[varName] || q.default,
        ...(q.choices ? { options: q.choices } : {})
      } as InquirerQuestion);
    } else {
      questions.push({
        name: varName,
        message: `Enter ${varName}`,
        type: 'text',
        required: true,
        default: seedValues[varName]
      } as InquirerQuestion);
    }
  }
  
  questions.push(...additionalQuestions);
  
  if (argv.nonInteractive) {
    log.info('Non-interactive mode: using defaults and provided values');
  }
  
  const answers = argv.nonInteractive
    ? mergeSeedValues(seedValues, argv)
    : await prompter.prompt(argv, questions);
  
  const finalVars = mergeSeedValues(seedValues, answers);
  
  if (strict) {
    const requiredVars = new Set(
      Array.from(allVarNames).filter(varName => {
        const q = questionMap.get(varName);
        return !q || q.required !== false;
      })
    );
    
    const validation = validateRequiredVars(requiredVars, finalVars);
    if (!validation.valid) {
      const missingList = validation.missing.map(v => `  - ${v}`).join('\n');
      throw new Error(
        `Missing required variables:\n${missingList}\n\n` +
        `To fix this:\n` +
        `1. Provide values via CLI arguments (e.g., --${validation.missing[0].toLowerCase()}=value)\n` +
        `2. Run in interactive mode (remove --non-interactive)\n` +
        `3. Use --no-strict to allow undefined variables (not recommended)`
      );
    }
  }
  
  if (showVars) {
    console.log('\n' + '='.repeat(60));
    console.log('Resolved Variables:');
    console.log('='.repeat(60));
    Object.keys(finalVars).sort().forEach(key => {
      console.log(`  ${key}: ${finalVars[key]}`);
    });
    console.log('='.repeat(60) + '\n');
  }
  
  const targetDir = cwd;
  
  renderStrict(templates, targetDir, finalVars, {
    dryRun,
    strict,
    verbose
  });
  
  if (!dryRun) {
    log.success(`${type} initialized successfully at: ${targetDir}`);
  }
  
  return {
    vars: finalVars,
    targetDir,
    dryRun
  };
}
