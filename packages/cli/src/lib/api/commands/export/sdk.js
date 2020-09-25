import { getCurrentContext } from '../../env';
import { gql as gqlGenPure } from 'graphile-gen';
import { IntrospectionQuery, parseGraphQuery } from 'introspectron';
import { print } from 'graphql/language';

import { GraphQLClient } from 'graphql-request';
import { prompt } from 'inquirerer';
import inflection from 'inflection';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const getFilename = (key, convention) => {
  switch (convention) {
    case 'underscore':
      return inflection.underscore(key);
    case 'dashed':
      return inflection.underscore(key).replace(/_/g, '-');
    case 'camelUpper':
      return inflection.camelize(key, false);
    default:
      return key;
  }
};

export default async (ctx, argv) => {
  const context = await getCurrentContext();
  console.log(context);
  console.log(ctx);

  const { url, useauth } = await prompt(
    [
      {
        name: 'url',
        message: 'url',
        type: 'string',
        required: true
      },
      {
        name: 'useauth',
        message: 'auth header?',
        type: 'confirm',
        required: true
      }
    ],
    argv
  );

  const headers = {};
  if (useauth) {
    const { authorization } = await prompt(
      [
        {
          name: 'authorization',
          message: 'authorization',
          type: 'password',
          required: true
        }
      ],
      argv
    );
    headers.authorization = authorization;
  }

  const { convention, folder, type } = await prompt(
    [
      {
        name: 'convention',
        message: 'convention',
        choices: ['underscore', 'dashed', 'camelcase', 'camelUpper'],
        type: 'list',
        required: true
      },
      {
        name: 'type',
        message: 'which file type?',
        choices: ['js', 'graphql'],
        type: 'list',
        required: true
      },
      {
        name: 'folder',
        message: 'folder',
        type: 'string',
        required: true
      }
    ],
    argv
  );

  const client = new GraphQLClient(url, { headers });

  const results = await client.request(IntrospectionQuery);
  const { queries, mutations } = parseGraphQuery(results);

  const pth = path.join(process.cwd(), folder);
  mkdirp.sync(pth);

  if (type === 'js') {
    const val = gqlGenPure.generate({ ...queries, ...mutations });
    const gqlObj = Object.keys(val).reduce((m, key) => {
      const ast = val[key].ast;
      const ql = (print(ast) || '')
        .split('\n')
        .map((line) => '    ' + line)
        .join('\n')
        .trim();
      const str = `export const ${key} = gql\`
      ${ql}\`;`;
      m[key] = str;
      return m;
    }, {});

    const indexJs = [];
    Object.keys(gqlObj).forEach((key) => {
      const code = `import gql from 'graphql-tag';
  
  ${gqlObj[key]}
      `;

      const filename = getFilename(key, convention) + '.js';
      fs.writeFileSync(path.join(pth, filename), code);
      indexJs.push(`export * from './${filename}';`);
    });
    fs.writeFileSync(path.join(pth, 'index.js'), indexJs.sort().join('\n'));
  } else if (type === 'graphql') {
    const val = gqlGenPure.generate({ ...queries, ...mutations });
    const gqlObj = Object.keys(val).reduce((m, key) => {
      const ast = val[key].ast;
      const ql = print(ast);
      m[key] = ql;
      return m;
    }, {});
    Object.keys(gqlObj).forEach((key) => {
      const code = gqlObj[key];
      const filename = getFilename(key, convention) + '.gql';
      fs.writeFileSync(path.join(pth, filename), code);
    });
  }

  console.log(`

  |||
 (o o)
ooO--(_)--Ooo-

✨ finished!
`);
};
