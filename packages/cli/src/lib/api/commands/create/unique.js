import { prompt } from 'inquirerer';
import { createUniqueConstraintMutation, getTablesQuery } from '../../graphql';
import { getDatabase, getTable, getField, getAny } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });

  const table = await getAny(
    client,
    {
      key: 'table',
      message: `table:`,
      nodes: tables.tables.nodes
    },
    args
  );

  const res = await prompt(
    [
      {
        type: 'checkbox',
        name: 'fields',
        message: 'choose fields',
        choices: table.fields.nodes.map((field) => field.name),
        required: true
      }
    ],
    {} // lets solve this
  );

  const fieldIds = table.fields.nodes
    .filter((node) => res.fields.includes(node.name))
    .map((n) => n.id);

  const constraint = await client.request(createUniqueConstraintMutation, {
    databaseId: db.id,
    tableId: table.id,
    fieldIds,
    name: 'anynameweneedtoremovethis'
  });

  console.log(constraint);
};
