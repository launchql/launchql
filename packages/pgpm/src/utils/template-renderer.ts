import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

/**
 * Simple template variable replacement
 * Replaces {{variableName}} with values from the context
 */
function renderTemplate(content: string, context: Record<string, any>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? String(context[key]) : match;
  });
}

/**
 * Recursively copy and render template files from source to destination
 * Skips .questions.json file
 */
export function copyAndRenderTemplates(
  sourcePath: string,
  destPath: string,
  context: Record<string, any>
): void {
  mkdirSync(destPath, { recursive: true });

  const entries = readdirSync(sourcePath, { withFileTypes: true });

  for (const entry of entries) {
    const sourceName = entry.name;
    const sourceFullPath = join(sourcePath, sourceName);

    if (sourceName === '.questions.json' || sourceName.startsWith('.git')) {
      continue;
    }

    const destName = renderTemplate(sourceName, context);
    const destFullPath = join(destPath, destName);

    if (entry.isDirectory()) {
      copyAndRenderTemplates(sourceFullPath, destFullPath, context);
    } else {
      const content = readFileSync(sourceFullPath, 'utf-8');
      const renderedContent = renderTemplate(content, context);
      writeFileSync(destFullPath, renderedContent, 'utf-8');
    }
  }
}
