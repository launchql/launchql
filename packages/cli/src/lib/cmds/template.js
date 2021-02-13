import { prompt } from 'inquirerer';
import { Templatizer } from 'tpsql';

const templateQuestion = [
  {
    _: true,
    type: 'path',
    message: 'deploy directory',
    name: 'deployDir'
  },
  {
    _: true,
    type: 'path',
    message: 'output directory',
    name: 'outputDir'
  }
];

export const aliases = ['t'];

export default async (argv) => {
  const { deployDir, outputDir } = await prompt(templateQuestion, argv);
  const template = new Templatizer(deployDir);
  const variables = await prompt(
    template
      .variables()
      .map((name) => ({ type: 'string', name, message: name })),
    argv
  );
  template.write(outputDir, variables);
  console.log(`done 🤩`);
};
