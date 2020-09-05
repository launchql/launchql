import { gql } from 'graphile-gen';
import { generateJS } from './utils';

export const generate = (introspectron) => {
  const val = gql.generate(introspectron);
  return Object.keys(val).reduce((m, key) => {
    m[key] = generateJS({ name: key, ast: val[key].ast });
    return m;
  }, {});
};
