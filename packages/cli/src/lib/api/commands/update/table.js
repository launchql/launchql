import { prompt } from 'inquirerer';
import { getDatabase, getTable } from '../../prompts';
import { getTablesQuery, updateTableMutation } from '../../graphql';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const tables = await ctx.db.request(getTablesQuery, {
    databaseId: db.id
  });
  const table = await getTable(ctx.db, tables.tables, args);

  const props = Object.keys(table).filter(
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
        type: typeof table[prop] === 'boolean' ? 'confirm' : 'string',
        name: prop,
        message: `enter value for ${prop}`,
        required: true
      };
    }),
    {} // dont pass in args for this one
  );

  const updated = await ctx.db.request(updateTableMutation, {
    id: table.id,
    ...getProps
  });

  console.log(getProps);
  console.log(updated);
};
