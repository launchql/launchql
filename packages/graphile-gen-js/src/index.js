import * as gen from 'graphile-gen';
import { print } from 'graphql/language';

const generateJS = ({ name, ast }) => {
  const ql = print(ast)
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n')
    .trim();
  return `
  export const ${name} = gql\`
    ${ql}\`;
  `;
};

export const updateOne = (defn) => {
  const val = gen.updateOne(defn);
  return generateJS(val);
};

export const createOne = (defn) => {
  const val = gen.createOne(defn);
  return generateJS(val);
};

export const deleteOne = (defn) => {
  const val = gen.deleteOne(defn);
  return generateJS(val);
};

export const getOne = (defn) => {
  const val = gen.getOne(defn);
  return generateJS(val);
};

export const getMany = (defn) => {
  const val = gen.getMany(defn);
  return generateJS(val);
};

export const getManyOwned = (defn, ownedKey) => {
  const val = gen.getManyOwned(defn, ownedKey);
  return generateJS(val);
};
