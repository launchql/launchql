import { prompt } from 'inquirerer';
import { createDatabaseMutation } from '../../graphql';

export default async (ctx, args) => {
  const { database } = await prompt(
    [
      {
        type: 'string',
        name: 'database',
        message: 'enter a database name',
        required: true
      }
    ],
    args
  );

  const result = await ctx.db.request(createDatabaseMutation, {
    name: database
  });
  console.log(JSON.stringify(result, null, 2));
};
