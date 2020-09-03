import { getSchemataQuery, getTablesByVisibilityQuery } from '../../graphql';
import { getDatabase, getSchema } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const result = await ctx.db.request(getSchemataQuery, {
    databaseId: db.id
  });
  // apparently you dont have schemaId on tables...
  const schema = await getSchema(ctx.db, result.schemata, args);

  const tables = await ctx.db.request(getTablesByVisibilityQuery, {
    databaseId: db.id,
    isVisible: schema.name === 'public'
  });

  tables.tables.nodes.forEach((el) => {
    console.log(`\n${el.name} [${el.id}]`);
    el.fields.nodes.forEach((field) => {
      console.log(`   ${field.name}: ${field.type}`);
    });
  });
};
