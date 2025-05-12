
import { compileTemplatesToFunctions } from './compileTemplatesToFunctions';
import { writeCompiledTemplatesToFile } from './writeCompiledTemplatesToFile';

const workspaceDir = '/Users/pyramation/code/hyperweb/create-interchain-app/boilerplates/lerna-workspace';
const compiled1 = compileTemplatesToFunctions(workspaceDir);
writeCompiledTemplatesToFile(workspaceDir, compiled1, './src/generated/workspace.ts');

const packageDir = '/Users/pyramation/code/hyperweb/create-interchain-app/boilerplates/lerna-workspace';
const compiled2 = compileTemplatesToFunctions(packageDir);
writeCompiledTemplatesToFile(packageDir, compiled2, './src/generated/workspace.ts');