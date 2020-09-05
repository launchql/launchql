import { print } from 'graphql/language';

export const generateJS = ({ name, ast }) => {
  const ql = (print(ast) || '')
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n')
    .trim();
  return `export const ${name} = gql\`
    ${ql}\`;`;
};
