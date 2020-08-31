import { getDatabasesQuery } from '../../graphql';

export default async (client, args) => {
  const result = await client.request(getDatabasesQuery);
  result.databases.nodes.forEach((el) => {
    console.log(`\n${el.name}:\n`);
    console.log(JSON.stringify(el, null, 2));
  });
};
