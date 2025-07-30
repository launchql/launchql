import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { extractFirst } from '../utils/argv';
import { selectPackage } from '../utils/module-utils';

const log = new Logger('tag');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const { first: tagName, newArgv } = extractFirst(argv);
  
  const cwdResult = await prompter.prompt(newArgv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);
  const cwd = (cwdResult as any).cwd || process.cwd();

  const pkg = new LaunchQLPackage(cwd);

  let packageName: string | undefined;
  
  if (pkg.isInModule()) {
    packageName = pkg.getModuleName();
    log.info(`Using current module: ${packageName}`);
  } else if (pkg.isInWorkspace()) {
    packageName = await selectPackage(newArgv, prompter, cwd, 'add tag to', log);
    if (!packageName) {
      return newArgv;
    }
  } else {
    throw new Error('This command must be run inside a LaunchQL workspace or module.');
  }

  const questions: Question[] = [];
  
  if (!tagName) {
    questions.push({
      type: 'text',
      name: 'tagName',
      message: 'Tag name',
      required: true,
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return false;
        }
        if (value.includes('/')) {
          return false;
        }
        if (value.includes('@')) {
          return false;
        }
        return true;
      }
    });
  }

  questions.push(
    {
      type: 'text',
      name: 'changeName',
      message: 'Target change name (leave empty for latest change)',
      required: false
    },
    {
      type: 'text',
      name: 'comment',
      message: 'Tag comment (optional)',
      required: false
    }
  );

  const answers = await prompter.prompt(newArgv, questions) as any;
  const finalTagName = tagName || answers.tagName;
  const changeName = answers.changeName;
  const comment = answers.comment;

  if (!pkg.isInModule()) {
    const moduleMap = pkg.getModuleMap();
    const module = moduleMap[packageName];
    if (!module) {
      throw new Error(`Module '${packageName}' not found.`);
    }
    
    const modulePkg = new LaunchQLPackage(module.path);
    
    try {
      modulePkg.addTag(finalTagName.trim(), changeName?.trim() || undefined, comment?.trim() || undefined);
      log.info(`Successfully added tag '${finalTagName}' to ${changeName || 'latest change'} in package '${packageName}'`);
    } catch (error) {
      log.error(`Failed to add tag: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  } else {
    try {
      pkg.addTag(finalTagName.trim(), changeName?.trim() || undefined, comment?.trim() || undefined);
      log.info(`Successfully added tag '${finalTagName}' to ${changeName || 'latest change'}`);
    } catch (error) {
      log.error(`Failed to add tag: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  return newArgv;
};
