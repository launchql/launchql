import { prompt } from 'inquirerer';
import { getDatabase } from '../../prompts';
import { updateDatabaseMutation } from '../../graphql';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);

  const props = Object.keys(db).filter(
    (field) => !['id', 'tableId'].includes(field)
  );

  const result = await prompt(
    [
      {
        type: 'checkbox',
        name: 'props',
        message: 'choose props',
        choices: props,
        required: true
      }
    ],
    args
  );

  const getProps = await prompt(
    result.props.map((prop) => {
      return {
        type: typeof db[prop] === 'boolean' ? 'confirm' : 'string',
        name: prop,
        message: `enter value for ${prop}`,
        required: true
      };
    }),
    {} // dont pass in args for this one
  );

  const updated = await ctx.db.request(updateDatabaseMutation, {
    id: db.id,
    ...getProps
  });

  console.log(getProps);
  console.log(updated);
};
