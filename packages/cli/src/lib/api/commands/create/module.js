import { prompt } from 'inquirerer';
import { getDatabase, getTable } from '../../prompts';
import { getModuleDefinitionsQuery, createModuleMutation } from '../../graphql';
import { lqlEnv } from '../../env';
import { GraphQLClient } from 'graphql-request';
import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

export default async (client, args) => {
  const env = await lqlEnv();
  const client2 = new GraphQLClient(env.MODULE_GRAPHQL_URL);
  const result = await client2.request(getModuleDefinitionsQuery);
  const db = await getDatabase(client, args);

  const { module } = await prompt(
    [
      {
        _: true,
        type: 'autocomplete',
        name: 'module',
        message: 'which module?',
        source: makeSearch(result.moduleDefinitions.nodes.map((n) => n.name))
      }
    ],
    args
  );

  const mod = result.moduleDefinitions.nodes.find((n) => n.name === module);

  const required = mod.mods?.map((mod) =>
    result.moduleDefinitions.nodes
      .filter((n) => n.id === mod)
      .map((n) => n.name)
  );
  if (required) {
    console.log(`required modules: ${required}`);
  }

  const fields = mod.fields.nodes.filter((n) => n.isRequired);
  const optional = mod.fields.nodes.filter((n) => !n.isRequired);

  console.log({ optional });
  console.log({ fields });

  const props = await prompt(
    fields.map((field) => {
      return {
        type: 'string',
        name: field.name,
        message: `value for ${field.name}`
      };
    }),
    {} // no args
  );

  console.log(props);

  console.log(db.id, mod.id);

  const result3 = await client2.request(createModuleMutation, {
    databaseId: db.id,
    moduleDefnId: mod.id,
    data: props
  });
  console.log(JSON.stringify(result3, null, 2));
};
