
import { compileTemplatesToFunctions } from '../src/templatize/compileTemplatesToFunctions';
import { writeCompiledTemplatesToFile } from '../src/templatize/writeCompiledTemplatesToFile';

const workspaceDir = '/Users/pyramation/code/hyperweb/create-interchain-app/boilerplates/lerna-workspace';
const compiled1 = compileTemplatesToFunctions(workspaceDir);
writeCompiledTemplatesToFile(workspaceDir, compiled1, './src/generated/workspace.ts');

const packageDir = '/Users/pyramation/code/hyperweb/create-interchain-app/boilerplates/lerna-module';
const compiled2 = compileTemplatesToFunctions(packageDir);
writeCompiledTemplatesToFile(packageDir, compiled2, './src/generated/module.ts');