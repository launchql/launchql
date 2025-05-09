import { prompt } from 'inquirerer';
import { parse } from 'pgsql-parser';

const fs = require('fs');

const questions = [
  {
    _: true,
    name: 'file',
    message: 'file path',
    required: true
  }
];

export default async (argv) => {
  const { file } = await prompt(questions, argv);
  const filepath = file.startsWith('/') ? file : process.cwd() + '/' + file;
  const contents = fs.readFileSync(filepath).toString();
  try {
    const parsed = parse(contents);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log(e);
  }
};
