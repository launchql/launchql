import { getSchemataQuery } from '../../graphql';
import { getDatabase } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const final = await ctx.db.request(getSchemataQuery, {
    databaseId: db.id
  });

  final.schemata.nodes.forEach((el) => {
    console.log(`\n${el.name}:\n`);
    console.log(JSON.stringify(el, null, 2));
  });
};
