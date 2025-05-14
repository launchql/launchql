import fs from 'fs';
import path from 'path';
import { CompiledTemplate } from './compileTemplatesToFunctions';

export function writeCompiledTemplatesToFile(
  srcDir: string,
  templates: CompiledTemplate[],
  outFile: string
) {
  const dir = path.dirname(outFile);
  fs.mkdirSync(dir, { recursive: true });

  const header = `// Auto-generated template module\n\n`;

  const functionBodies = templates.map(({ rawRelPath }) => {
    const raw = fs.readFileSync(path.resolve(srcDir, rawRelPath), 'utf8')
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${') // avoid accidental interpolation
      .replace(/__([A-Z0-9_]+)__/g, (_, v) => `\${vars.${v}}`);

    const relPath = rawRelPath.replace(/__([A-Z0-9_]+)__/g, (_, v) => `\${vars.${v}}`);

    return `(vars: Record<string, any>) => {
  const relPath = \`${relPath}\`;
  const content = \`${raw}\`;
  return { relPath, content };
}`;
  });

  const exportBlock = `export default [\n${functionBodies.join(',\n\n')}\n];`;

  const fullContent = header + exportBlock;

  fs.writeFileSync(outFile, fullContent);
}