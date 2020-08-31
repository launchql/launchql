import { prompt } from 'inquirerer';
import { getDatabase, getTable, getField } from '../../prompts';
import { getTablesQuery, updateFieldMutation } from '../../graphql';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });
  const table = await getTable(client, tables.tables, args);
  const field = await getField(client, table.fields, args);

  const props = Object.keys(field).filter(
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
        type: typeof field[prop] === 'boolean' ? 'confirm' : 'string',
        name: prop,
        message: `enter value for ${prop}`,
        required: true
      };
    }),
    {} // dont pass in args for this one
  );

  const updated = await client.request(updateFieldMutation, {
    fieldId: field.id,
    ...getProps
  });

  console.log(getProps);
  console.log(updated);
};
