import fs from 'fs';
import { sync as globSync } from 'glob';
import path from 'path';

export interface CompiledTemplate {
  funcName: string;
  render: (vars: Record<string, any>) => {
    relPath: string;
    content: string;
  };
  rawRelPath: string;
  originalPath: string;
}

function escapeTemplateLiterals(content: string): string {
  return content
    .replace(/\\/g, '\\\\')       // Escape backslashes
    .replace(/`/g, '\\`')         // Escape backticks
    .replace(/\$\{/g, '\\${');    // Escape `${` to not trigger early
}

function replaceDoubleUnderscoreVars(str: string): string {
  return str.replace(/__([A-Z0-9_]+)__/g, (_, varName) => `\${vars.${varName}}`);
}

const IGNORE = ['.DS_Store'];

export function compileTemplatesToFunctions(srcDir: string): CompiledTemplate[] {
  const fileSet = new Set<string>([
    ...globSync('**/*', { cwd: srcDir, nodir: true }),
    ...globSync('**/.*', { cwd: srcDir, nodir: true }),
  ].filter(a=>!IGNORE.includes(a)));

  return Array.from(fileSet).map((rawRelPath) => {
    const fullPath = path.join(srcDir, rawRelPath);
    const rawContent = fs.readFileSync(fullPath, 'utf8');

    const escapedContent = escapeTemplateLiterals(rawContent);
    const contentTemplate = replaceDoubleUnderscoreVars(escapedContent);
    const pathTemplate = replaceDoubleUnderscoreVars(rawRelPath);

    // Generate a safe function name
    let funcName = rawRelPath
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (/^\d/.test(funcName)) funcName = '_' + funcName;

    const render = (vars: Record<string, any>) => {
      const relPath = new Function('vars', `return \`${pathTemplate}\`;`)(vars);
      const content = new Function('vars', `return \`${contentTemplate}\`;`)(vars);
      return { relPath, content };
    };

    return {
      funcName,
      render,
      rawRelPath,
      originalPath: fullPath
    };
  });
}
