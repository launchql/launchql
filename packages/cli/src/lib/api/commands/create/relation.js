import { prompt } from 'inquirerer';
import {
  createForeignKeyConstraintMutation,
  getTablesQuery
} from '../../graphql';
import { getDatabase, getTable, getField, getAny } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);
  const tables = await ctx.db.request(getTablesQuery, {
    databaseId: db.id
  });

  // const table1 = await getTable(ctx.db, tables.tables, args);
  const table1 = await getAny(
    ctx.db,
    {
      key: 'table',
      message: `table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  const field1 = await getAny(
    ctx.db,
    {
      key: 'field',
      message: `${table1.name} field:`,
      nodes: table1.fields.nodes
    },
    args
  );
  const table2 = await getAny(
    ctx.db,
    {
      key: 'refTable',
      message: `reference table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  const field2 = await getAny(
    ctx.db,
    {
      key: 'refField',
      message: `${table2.name} field:`,
      nodes: table2.fields.nodes
    },
    args
  );

  // console.log({ table1, table2, field1, field2 });

  const constraint = await ctx.db.request(createForeignKeyConstraintMutation, {
    databaseId: db.id,
    tableId: table1.id,
    fieldId: field1.id,
    refTableId: table2.id,
    refFieldId: field2.id,
    name: 'anynameweneedtoremovethis'
  });

  console.log(constraint);
};
