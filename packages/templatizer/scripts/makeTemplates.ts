import { resolve } from 'path';

import { compileTemplatesToFunctions } from '../src/templatize/compileTemplatesToFunctions';
import { writeCompiledTemplatesToFile } from '../src/templatize/writeCompiledTemplatesToFile';

const workspaceDir = resolve(__dirname + '/../../../boilerplates/workspace');
const compiled1 = compileTemplatesToFunctions(workspaceDir);
writeCompiledTemplatesToFile(workspaceDir, compiled1, './src/generated/workspace.ts');

const packageDir = resolve(__dirname + '/../../../boilerplates/module');
const compiled2 = compileTemplatesToFunctions(packageDir);
writeCompiledTemplatesToFile(packageDir, compiled2, './src/generated/module.ts');