import { getDatabasesQuery } from '../../graphql';

export default async (ctx, args) => {
  const result = await ctx.db.request(getDatabasesQuery);
  result.databases.nodes.forEach((el) => {
    console.log(`\n${el.name}:\n`);
    console.log(JSON.stringify(el, null, 2));
  });
};
