import fs from 'fs';
import path from 'path';
import * as mkdirp from 'mkdirp';
import { CompiledTemplate } from './compileTemplatesToFunctions';

export function writeCompiledTemplatesToFile(
  srcDir: string,
  templates: CompiledTemplate[],
  outFile: string
) {
  const dir = path.dirname(outFile);
  mkdirp.sync(dir);

  const header = `// Auto-generated template module\n\n`;

  const functionBodies = templates.map(({ funcName, rawRelPath }) => {
    return `export const ${funcName} = (vars: Record<string, any>) => {
  const relPath = \`${rawRelPath.replace(/__([A-Z0-9_]+)__/g, (_, v) => `\${vars.${v}}`)}\`;
  const content = \`${fs.readFileSync(path.resolve(srcDir, rawRelPath), 'utf8')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/__([A-Z0-9_]+)__/g, (_, v) => `\${vars.${v}}`)
  }\`;
  return { relPath, content };
};`;
  });

  const exportAll = `\n\nexport default {\n${templates
    .map(({ funcName }) => `  ${funcName}`)
    .join(',\n')}\n};`;

  const fullContent = header + functionBodies.join('\n\n') + exportAll;

  fs.writeFileSync(outFile, fullContent);
}
