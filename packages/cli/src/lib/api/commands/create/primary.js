import { prompt } from 'inquirerer';
import {
  createPrimaryKeyConstraintMutation,
  getTablesQuery
} from '../../graphql';
import { getDatabase, getAny } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const tables = await ctx.db.request(getTablesQuery, {
    databaseId: db.id
  });

  const table = await getAny(
    ctx.db,
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

  const constraint = await ctx.db.request(createPrimaryKeyConstraintMutation, {
    databaseId: db.id,
    tableId: table.id,
    fieldIds,
    name: 'anynameweneedtoremovethis'
  });

  console.log(constraint);
};
