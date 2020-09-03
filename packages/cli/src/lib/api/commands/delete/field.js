import { deleteFieldMutation, getTablesQuery } from '../../graphql';
import { getDatabase, getAny } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const tables = await ctx.db.request(getTablesQuery, {
    databaseId: db.id
  });

  // const table1 = await getTable(ctx.db, tables.tables, args);
  const table1 = await getAny(
    ctx.db,
    {
      key: 'table',
      message: `table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  const field1 = await getAny(
    ctx.db,
    {
      key: 'field',
      message: `${table1.name} field to remove:`,
      nodes: table1.fields.nodes
    },
    args
  );
  const result = await ctx.db.request(deleteFieldMutation, {
    id: field1.id
  });
  console.log(JSON.stringify(result, null, 2));
};
