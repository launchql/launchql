import { exec } from 'child_process';
import { prompt } from 'inquirerer';

const questions = [
  {
    name: 'name',
    message: 'module name',
    required: true
  },
  {
    name: 'comment',
    message: 'comment or description',
    required: true
  }
];
export default async (argv) => {
  const { name, comment } = await prompt(questions, argv);
  const cmd = ['sqitch', 'add', name, '--n', comment].join(' ');
  const sqitch = exec(cmd.trim());
  sqitch.stdout.pipe(process.stdout);
  sqitch.stderr.pipe(process.stderr);
};
