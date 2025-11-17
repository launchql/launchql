import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import path from 'path';

type Func = (vars: Record<string, any>) => { relPath: string, content: string };

export function writeRenderedTemplates(
  templates: Func[],
  outDir: string,
  vars: Record<string, any>
) {
  templates.forEach(tmpl => {
    const output = tmpl(vars);
    const outPath = path.join(outDir, output.relPath);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, output.content);
  });

  // Remove .questions.json after templates are written (it's a template artifact, not needed in final output)
  const questionsPath = path.join(outDir, '.questions.json');
  if (existsSync(questionsPath)) {
    unlinkSync(questionsPath);
  }
}