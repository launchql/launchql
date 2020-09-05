import { getCurrentContext } from '../../env';
import { gql as gqlGen } from 'graphile-gen-js';
import { IntrospectionQuery, parseGraphQuery } from 'introspectron';
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

  const { convention } = await prompt(
    [
      {
        name: 'convention',
        message: 'convention',
        choices: ['underscore', 'dashed', 'camelcase', 'camelUpper'],
        type: 'list',
        required: true
      }
    ],
    argv
  );

  const client = new GraphQLClient(url, { headers });

  const results = await client.request(IntrospectionQuery);
  const { queries, mutations } = parseGraphQuery(results);
  const obj = gqlGen.generate({ ...queries, ...mutations });

  const pth = path.join(process.cwd(), 'codegen');
  mkdirp.sync(pth);

  const indexJs = [];
  Object.keys(obj).forEach((key) => {
    const code = `import gql from 'graphql-tag';

${obj[key]}
    `;

    const filename = getFilename(key, convention) + '.js';
    fs.writeFileSync(path.join(pth, filename), code);
    indexJs.push(`export * from './${filename}';`);
  });
  fs.writeFileSync(path.join(pth, 'index.js'), indexJs.sort().join('\n'));

  console.log(`

  |||
 (o o)
ooO--(_)--Ooo-

✨ finished!
`);
};
