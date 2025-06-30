import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { Logger } from '@launchql/logger';
import { verifyProject } from '@launchql/migrate';
import { getTargetDatabase } from '../utils';
import { selectModule } from '../utils/module-utils';

const log = new Logger('verify');

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const database = await getTargetDatabase(argv, prompter, {
    message: 'Select database'
  });

  const questions: Question[] = [];

  let { recursive, cwd, 'use-sqitch': useSqitch } = await prompter.prompt(argv, questions);

  log.debug(`Using current directory: ${cwd}`);

  let projectName: string | undefined;
  if (recursive) {
    projectName = await selectModule(argv, prompter, 'Choose a project to verify', cwd);
    log.info(`Selected project: ${projectName}`);
  }

  await verifyProject({
    database,
    cwd,
    recursive,
    projectName,
    useSqitch
  });

  log.success('Verify complete.');

  return argv;
};
