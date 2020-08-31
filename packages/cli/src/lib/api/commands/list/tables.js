import { getSchemataQuery, getTablesByVisibilityQuery } from '../../graphql';
import { getDatabase, getSchema } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const result = await client.request(getSchemataQuery, {
    databaseId: db.id
  });
  // apparently you dont have schemaId on tables...
  const schema = await getSchema(client, result.schemata, args);

  const tables = await client.request(getTablesByVisibilityQuery, {
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
