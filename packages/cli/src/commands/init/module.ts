  // const moduleQuestions: Question[] = [
  //   // {
  //   //   name: 'USERFULLNAME',
  //   //   message: 'Enter author full name',
  //   //   required: true,
  //   //   default: username,
  //   //   useDefault: true,
  //   //   type: 'text',
  //   // },
  //   // {
  //   //   name: 'USEREMAIL',
  //   //   message: 'Enter author email',
  //   //   required: true,
  //   //   default: email,
  //   //   useDefault: true,
  //   //   type: 'text',
  //   // },
  //   {
  //     name: 'MODULENAME',
  //     message: 'Enter the module name',
  //     required: true,
  //     type: 'text',
  //   },
  //   // {
  //   //   name: 'REPONAME',
  //   //   message: 'Enter the repository name',
  //   //   required: true,
  //   //   type: 'text',
  //   // },
  //   // {
  //   //   name: 'USERNAME',
  //   //   message: 'Enter your GitHub username',
  //   //   required: true,
  //   //   type: 'text',
  //   // },
  //   // {
  //   //   name: 'ACCESS',
  //   //   message: 'Module access?',
  //   //   required: true,
  //   //   type: 'autocomplete',
  //   //   options: ['public', 'restricted'],
  //   // },
  //   {
  //       name: 'extensions',
  //       message: 'which extensions?',
  //       options: availExtensions,
  //       type: 'checkbox',
  //       allowCustomOptions: true,
  //       // default: ['plpgsql'],
  //       // default: [{
  //       //      name: 'plpgsql',
  //       //      value: 'plpgsql'
  //       // }],
  //       required: true
  //     },
  // ];


import { Inquirerer, OptionValue, Question } from 'inquirerer';
import chalk from 'chalk';
import { LaunchQLProject, sluggify } from '@launchql/migrate';
import { execSync } from 'child_process';

export default async function runModuleSetup(argv: Partial<Record<string, any>>, prompter: Inquirerer) {
  const username = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
  const email = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
  const { cwd = process.cwd() } = argv;

  const project = new LaunchQLProject(cwd);
  await project.init();

  if (!project.workspacePath) {
    console.error(chalk.red('Error: Not inside a LaunchQL workspace.'));
    process.exit(1);
  }

  if (!project.isInAllowedDir() && !project.isInWorkspace()) {
    console.error(chalk.red(`Error: You must be inside one of the workspace packages.`));
    process.exit(1);
  }

  const availExtensions = project.getAvailableModules();

  const moduleQuestions: Question[] = [
    {
      name: 'MODULENAME',
      message: 'Enter the module name',
      required: true,
      type: 'text',
    },
    {
      name: 'extensions',
      message: 'Which extensions?',
      options: availExtensions,
      type: 'checkbox',
      allowCustomOptions: true,
      required: true,
    },
  ];

  const answers = await prompter.prompt(argv, moduleQuestions);
  const modName = sluggify(answers.MODULENAME);

  const extensions = answers.extensions
    .filter((opt: OptionValue) => opt.selected)
    .map((opt: OptionValue) => opt.name);


    project.initModule(modName, {
      ...argv,
      ...answers,
      // @ts-ignore
    USERFULLNAME: username,
    USEREMAIL: email,
    extensions
  })

  return { ...argv, ...answers };
}
