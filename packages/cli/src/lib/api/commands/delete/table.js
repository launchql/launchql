import { deleteTableMutation, getTablesQuery } from '../../graphql';
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
  console.log(table1.id);
  const result = await ctx.db.request(deleteTableMutation, {
    id: table1.id
  });
  console.log(JSON.stringify(result, null, 2));
};
