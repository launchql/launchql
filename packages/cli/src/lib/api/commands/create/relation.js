import { prompt } from 'inquirerer';
import {
  createForeignKeyConstraintMutation,
  getTablesQuery
} from '../../graphql';
import { getDatabase, getTable, getField, getAny } from '../../prompts';

export default async (client, args) => {
  // tableId: UUID!
  // fieldId: UUID!
  // refTableId: UUID!
  // refFieldId: UUID!
  // name: 'we should not need this'

  //     const result = await client.request(createForeignKeyConstraintMutation, {
  //     tableId: UUID!
  //     fieldId: UUID!
  //     refTableId: UUID!
  //     refFieldId: UUID!
  //     name: String!
  //   });
  //   console.log(JSON.stringify(result, null, 2));

  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });

  // const table1 = await getTable(client, tables.tables, args);
  const table1 = await getAny(
    client,
    {
      key: 'table',
      message: `table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  const field1 = await getAny(
    client,
    {
      key: 'field',
      message: `${table1.name} field:`,
      nodes: table1.fields.nodes
    },
    args
  );
  const table2 = await getAny(
    client,
    {
      key: 'refTable',
      message: `reference table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  const field2 = await getAny(
    client,
    {
      key: 'refField',
      message: `${table2.name} field:`,
      nodes: table2.fields.nodes
    },
    args
  );

  // console.log({ table1, table2, field1, field2 });

  const constraint = await client.request(createForeignKeyConstraintMutation, {
    databaseId: db.id,
    tableId: table1.id,
    fieldId: field1.id,
    refTableId: table2.id,
    refFieldId: field2.id,
    name: 'anynameweneedtoremovethis'
  });

  console.log(constraint);
};
