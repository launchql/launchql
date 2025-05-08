import { Request } from 'express';

interface Database {
  datname: string;
}

interface Schema {
  table_schema: string;
}

interface PrintDatabasesParams {
  databases: Database[];
  req: Request;
  port: number;
}

interface PrintSchemasParams {
  dbName: string;
  schemas: Schema[];
  req: Request;
  hostname: string;
  port: number;
}

export const printDatabases = ({ databases, req, port }: PrintDatabasesParams): string => {
  return (
    '<style>html { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" }</style>' +
    '<h1>Databases</h1>' +
    '<hr />' +
    databases
      .map((d): [Database, string] => [d, `${req.protocol}://${d.datname}.${req.hostname}:${port}`])
      .map(([d, url]) => {
        return `<a href="${url}">${d.datname}</a><br />`;
      })
      .join('\n')
  );
};

export const printSchemas = ({ dbName, schemas, req, hostname, port }: PrintSchemasParams): string => {
  return (
    `<style>html { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" }</style>` +
    `<h1>Schemas in ${dbName}</h1>` +
    `<a href="${req.protocol}://${hostname}:${port}">back to root</a>` +
    `<hr />` +
    schemas
      .map((d): [Schema, string] => [
        d,
        `${req.protocol}://${d.table_schema}.${req.hostname}:${port}/graphiql`
      ])
      .map(([d, url]) => {
        return `<a href="${url}">${d.table_schema}</a><br />`;
      })
      .join('\n')
  );
};
