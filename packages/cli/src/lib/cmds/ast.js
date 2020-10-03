import { prompt } from 'inquirerer';
import { resolve, join } from 'path';
const parser = require('pgsql-parser');

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
  const filepath = resolve(process.cwd() + '/' + file);
  try {
    const contents = parser.parse(fs.readFileSync(filepath).toString());
    console.log(JSON.stringify(contents, null, 2));
  } catch (e) {
    console.log('file does not exist!');
  }
};
