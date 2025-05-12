import fs from 'fs';
import path from 'path';
import * as mkdirp from 'mkdirp';

type Func = (vars: Record<string, any>) => { relPath: string, content: string };

export function writeRenderedTemplates(
    templates: Func[],
    outDir: string,
    vars: Record<string, any>
) {
    templates.forEach(tmpl => {
        const output = tmpl(vars);
        const outPath = path.join(outDir, output.relPath);
        mkdirp.sync(path.dirname(outPath));
        fs.writeFileSync(outPath, output.content);
    })
}
