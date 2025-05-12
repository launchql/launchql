import fs from 'fs';
import path from 'path';
import * as mkdirp from 'mkdirp';

export function writeRenderedTemplates(
  templates: ((vars: Record<string, any>) => { relPath: string, content: string })[],
  outDir: string,
  vars: Record<string, any>
) {
  for (const tmpl of templates) {
    const output = tmpl(vars);
    const outPath = path.join(outDir, output.relPath);
    mkdirp.sync(path.dirname(outPath));
    fs.writeFileSync(outPath, output.content);
  }
}
