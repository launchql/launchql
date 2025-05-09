import { prompt } from 'inquirerer';
import { deleteDatabaseMutation } from '../../graphql';
import { getDatabase } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);

  const result = await ctx.db.request(deleteDatabaseMutation, {
    id: db.id
  });
  console.log(JSON.stringify(result, null, 2));
};
