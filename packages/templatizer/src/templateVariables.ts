import { existsSync, readFileSync } from 'fs';
import { sync as globSync } from 'glob';
import { join } from 'path';

/**
 * Question definition from .questions.json files
 */
export interface TemplateQuestion {
  name: string;
  message: string;
  required?: boolean;
  type?: string;
  choices?: string[];
  default?: any;
}

/**
 * Extract all variable names referenced in template files
 * Scans both filenames and file contents for __VARNAME__ patterns
 */
export function extractTemplateVariables(templateDir: string): Set<string> {
  const variables = new Set<string>();
  const varPattern = /__([A-Z0-9_]+)__/g;

  const files = [
    ...globSync('**/*', { cwd: templateDir, nodir: true }),
    ...globSync('**/.*', { cwd: templateDir, nodir: true, dot: true })
  ].filter(f => f !== '.questions.json'); // Exclude .questions.json itself

  files.forEach(relPath => {
    let match;
    while ((match = varPattern.exec(relPath)) !== null) {
      variables.add(match[1]);
    }

    const fullPath = join(templateDir, relPath);
    try {
      const content = readFileSync(fullPath, 'utf-8');
      varPattern.lastIndex = 0; // Reset regex
      while ((match = varPattern.exec(content)) !== null) {
        variables.add(match[1]);
      }
    } catch (err) {
    }
  });

  return variables;
}

/**
 * Load and parse .questions.json from a template directory
 * Returns empty array if file doesn't exist or if questions look like template placeholders
 * 
 * Note: .questions.json files in boilerplates often contain template variables like
 * "__USERFULLNAME__" which are meant to be rendered into generated projects, not used
 * as init-time questions. We filter these out by checking if ALL question names are
 * wrapped in double underscores (template placeholder pattern).
 */
export function loadTemplateQuestions(templateDir: string): TemplateQuestion[] {
  const questionsPath = join(templateDir, '.questions.json');
  
  if (!existsSync(questionsPath)) {
    return [];
  }

  try {
    const content = readFileSync(questionsPath, 'utf-8');
    const questions = JSON.parse(content);
    
    if (!Array.isArray(questions)) {
      console.warn(`Warning: .questions.json in ${templateDir} is not an array`);
      return [];
    }

    const allAreTemplatePlaceholders = questions.every(q => 
      typeof q.name === 'string' && /^__[A-Z0-9_]+__$/.test(q.name)
    );

    if (allAreTemplatePlaceholders) {
      return [];
    }

    return questions.map(q => ({
      ...q,
      name: q.name.replace(/^__/, '').replace(/__$/, '')
    }));
  } catch (err) {
    console.warn(`Warning: Failed to parse .questions.json in ${templateDir}:`, err);
    return [];
  }
}

/**
 * Compute missing variables by comparing required variables with provided ones
 * Returns a Set of variable names that are missing
 */
export function computeMissingVariables(
  requiredVars: Set<string>,
  providedVars: Record<string, any>
): Set<string> {
  const missing = new Set<string>();
  const providedKeys = new Set(Object.keys(providedVars));

  for (const varName of requiredVars) {
    if (!providedKeys.has(varName)) {
      missing.add(varName);
    }
  }

  return missing;
}

/**
 * Generate sensible defaults for common template variables
 */
export function generateVariableDefaults(
  varName: string,
  context: Record<string, any>
): any {
  switch (varName) {
    case 'PACKAGE_IDENTIFIER':
      return context.name || context.MODULENAME;
    
    case 'MODULEDESC':
      return context.name ? `${context.name} module` : 'LaunchQL module';
    
    case 'REPONAME':
      return context.name || context.MODULENAME;
    
    case 'ACCESS':
      return 'public';
    
    default:
      return undefined;
  }
}

/**
 * Convert template questions to inquirerer Question format
 */
export function convertToInquirerQuestions(
  templateQuestions: TemplateQuestion[],
  context: Record<string, any>
): any[] {
  return templateQuestions.map(tq => {
    const question: any = {
      name: tq.name,
      message: tq.message,
      required: tq.required !== false, // Default to required
      type: tq.type || 'text'
    };

    if (tq.default !== undefined) {
      question.default = tq.default;
    } else {
      const generatedDefault = generateVariableDefaults(tq.name, context);
      if (generatedDefault !== undefined) {
        question.default = generatedDefault;
        question.useDefault = true;
      }
    }

    if (tq.choices && tq.choices.length > 0) {
      question.options = tq.choices;
    }

    return question;
  });
}
