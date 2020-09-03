import { getTablesQuery } from '../../graphql';
import { getDatabase, getTable } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const tables = await ctx.db.request(getTablesQuery, {
    databaseId: db.id
  });

  const table = await getTable(ctx.db, tables.tables, args);

  tables.tables.nodes.forEach((el) => {
    if (el.id !== table.id) return;
    console.log(`\n${el.name}:`);
    el.fields.nodes.forEach((field) => {
      console.log(`   ${field.name}: ${field.type}`);
    });
  });
};
