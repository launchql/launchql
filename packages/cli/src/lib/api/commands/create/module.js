import { prompt } from 'inquirerer';
import { getDatabase, getTable } from '../../prompts';
import {
  getModuleDefinitionsQuery,
  createModuleMutation,
  getModuleOutputsByDefinitionsIds
} from '../../graphql';
import { lqlEnv } from '../../env';
import { GraphQLClient } from 'graphql-request';
import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

export default async (client, args) => {
  const env = await lqlEnv();
  const client2 = new GraphQLClient(env.MODULE_GRAPHQL_URL);
  const result = await client2.request(getModuleDefinitionsQuery);
  const db = await getDatabase(client, args);

  const { mod: module } = await prompt(
    [
      {
        _: true,
        type: 'autocomplete',
        name: 'mod',
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

  const reqIds = mod.mods || [];

  const requiredModules = await client2.request(
    getModuleOutputsByDefinitionsIds,
    {
      databaseId: db.id,
      moduleDefnIds: reqIds
    }
  );
  console.log(JSON.stringify({ requiredModules }, null, 2));

  const missingModules = requiredModules.moduleDefinitions.nodes.map((v) => {
    return {
      name: v.name,
      exists: v.modules.nodes.length > 0
    };
  }, []);

  missingModules.forEach((modInst) => {
    if (modInst.exists) return;
    console.log(`requires install ${modInst.name}`);
    // throw new Error(`requires install ${modInst.name}`);
    process.exit(1);
  });

  //   return;
  const fields = mod.fields.nodes.filter((n) => n.isRequired);
  const optional = mod.fields.nodes.filter((n) => !n.isRequired);

  //   console.log({ optional });
  //   console.log({ fields });

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

  console.log({ props });
  const props2 = Object.keys(props).reduce((m, v) => {
    if (props[v].length > 0) {
      m[v] = props[v];
    }
    return m;
  }, {});
  console.log({ props2 });

  //   console.log(db.id, mod.id);
  //   console.log({ mod });
  console.log(`installing ${mod.name}`);
  const result3 = await client2.request(createModuleMutation, {
    databaseId: db.id,
    moduleDefnId: mod.id,
    context: mod.context,
    data: props2
  });

  // NOTE: if you have these, even if it is required, you don't need it
  // defaultModuleId: 'feb139e8-a7de-4c3a-887f-5a1e2876a610',
  // defaultModuleValue: 'table_id' } ]

  console.log(JSON.stringify(result3, null, 2));
};
