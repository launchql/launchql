import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

type TemplateFunc = (vars: Record<string, any>) => { relPath: string; content: string };

export interface RenderOptions {
  /** If true, show what would be written without actually writing files */
  dryRun?: boolean;
  /** If true, throw error on missing variables (default: true) */
  strict?: boolean;
  /** If true, print detailed information about rendering */
  verbose?: boolean;
}

/**
 * Create a proxy around vars object that throws on missing keys
 * This prevents "undefined" from silently appearing in rendered templates
 */
function createStrictVarsProxy(vars: Record<string, any>, templatePath: string): Record<string, any> {
  return new Proxy(vars, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      
      throw new Error(
        `Missing required variable: "${prop}"\n` +
        `Referenced in template: ${templatePath}\n` +
        `Available variables: ${Object.keys(target).join(', ')}\n` +
        `\nTo fix this:\n` +
        `1. Add "${prop}" to your .questions.json file, or\n` +
        `2. Provide it via CLI argument: --${prop.toLowerCase()}=value, or\n` +
        `3. Use --no-strict to allow undefined variables (not recommended)`
      );
    }
  });
}

/**
 * Render templates with strict validation and optional dry-run mode
 * @param templates - Array of template functions to render
 * @param outDir - Output directory for rendered files
 * @param vars - Variables to pass to templates
 * @param options - Rendering options
 */
export function renderStrict(
  templates: TemplateFunc[],
  outDir: string,
  vars: Record<string, any>,
  options: RenderOptions = {}
): void {
  const { dryRun = false, strict = true, verbose = false } = options;
  
  if (verbose || dryRun) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Rendering ${templates.length} template(s) to: ${outDir}`);
    console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be written)' : 'LIVE'}`);
    console.log(`Strict: ${strict ? 'YES (fail on missing vars)' : 'NO (allow undefined)'}`);
    console.log(`${'='.repeat(60)}\n`);
    
    if (verbose) {
      console.log('Available variables:');
      Object.keys(vars).sort().forEach(key => {
        const value = vars[key];
        const displayValue = typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value;
        console.log(`  ${key}: ${JSON.stringify(displayValue)}`);
      });
      console.log('');
    }
  }
  
  const renderedFiles: Array<{ path: string; size: number }> = [];
  
  templates.forEach((tmpl, index) => {
    try {
      const varsToUse = strict ? createStrictVarsProxy(vars, `template #${index + 1}`) : vars;
      
      const output = tmpl(varsToUse);
      const outPath = path.join(outDir, output.relPath);
      
      if (dryRun || verbose) {
        console.log(`${dryRun ? '[DRY RUN] Would write' : 'Writing'}: ${output.relPath} (${output.content.length} bytes)`);
      }
      
      if (!dryRun) {
        mkdirSync(path.dirname(outPath), { recursive: true });
        writeFileSync(outPath, output.content);
      }
      
      renderedFiles.push({ path: output.relPath, size: output.content.length });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to render template #${index + 1}: ${error.message}`);
      }
      throw error;
    }
  });
  
  if (verbose || dryRun) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${dryRun ? 'Would render' : 'Rendered'} ${renderedFiles.length} file(s)`);
    console.log(`Total size: ${renderedFiles.reduce((sum, f) => sum + f.size, 0)} bytes`);
    console.log(`${'='.repeat(60)}\n`);
  }
}

/**
 * Validate that all required variables are present before rendering
 * @param requiredVars - Set of required variable names
 * @param providedVars - Object of provided variables
 * @returns Object with validation result and missing variables
 */
export function validateRequiredVars(
  requiredVars: Set<string>,
  providedVars: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!(varName in providedVars)) {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
