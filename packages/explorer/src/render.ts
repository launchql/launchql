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

interface PrintHtmlParams {
  title: string;
  children: string;
  rootUrl: string;
}

export const printHtml = ({ title, children, rootUrl }: PrintHtmlParams): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          .text-brand {
            color: #01a1ff;
          }
          .text-brand:hover {
            text-decoration: underline;
          }
          h1.text-brand:hover {
            text-decoration: none;
          }
        </style>
      </head>
      <body class="bg-gray-50 text-gray-900 font-sans p-6 text-sm leading-tight">
        <div class="max-w-4xl mx-auto space-y-4">
          <header class="flex items-center space-x-2">
            <a href="${rootUrl}" class="shrink-0 w-6 h-6 sm:w-8 sm:h-8" aria-label="Home">
              <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.95 61.24">
                <path d="M16.36 43.47a14.56 14.56 0 01-8.79 0A11.16 11.16 0 011 38.34a8.83 8.83 0 01-.45-1A8.09 8.09 0 01.76 31a10.08 10.08 0 013.68-4.17 6.23 6.23 0 01-.24-.65A8.17 8.17 0 014.68 20a10.47 10.47 0 014.53-4.53 13.25 13.25 0 012.12-.9 12.35 12.35 0 012.5-7.45A17.35 17.35 0 0122.7 1a22.38 22.38 0 0113.48 0 17.07 17.07 0 019.42 6.9 18.75 18.75 0 019.8.4 14 14 0 018.29 6.46 10.17 10.17 0 01.78 1.83 10 10 0 01-.59 7.56 13.05 13.05 0 01-5.64 5.64A17.05 17.05 0 0155.4 31l-39 12.45zM64.92 36q-1.05 4.48-10.54 7.63l-.36.12L15 56.22a9.87 9.87 0 01-1.91.41C6.88 57.55 2.16 54.78 0 51.24a8.2 8.2 0 00.56 3.2 7.45 7.45 0 00.45 1 11.09 11.09 0 006.56 5.13 14.64 14.64 0 008.79 0l39-12.45a17.07 17.07 0 002.84-1.2 13 13 0 005.64-5.63 10.19 10.19 0 001-5.27zm0-8.59q-1.05 4.49-10.54 7.64l-.36.12L15 47.64a9.84 9.84 0 01-1.91.4C6.88 49 2.16 46.19 0 42.65a8.28 8.28 0 00.56 3.21 8.83 8.83 0 00.45 1A11.16 11.16 0 007.57 52a14.64 14.64 0 008.79 0l39-12.45a17.05 17.05 0 002.84-1.19 13.05 13.05 0 005.64-5.64 10.17 10.17 0 001-5.27zM9 39.13a10.11 10.11 0 006 0l39-12.45a12.25 12.25 0 002.06-.87 8.52 8.52 0 003.7-3.62 5.52 5.52 0 00.37-4.19 6.6 6.6 0 00-.46-1A9.57 9.57 0 0054 12.68a14.17 14.17 0 00-8.48 0l-.16.05-.2.07-2 .69-.84-2c-.07-.16-.12-.27-.14-.33l-.18-.27a12.26 12.26 0 00-7.2-5.51 17.85 17.85 0 00-10.73 0 12.81 12.81 0 00-6.56 4.44 7.58 7.58 0 00-1.47 6l.45 2.29-2.31.4c-.27 0-.5.09-.68.13s-.46.12-.66.19a8.31 8.31 0 00-1.47.62A5.88 5.88 0 008.78 22a3.71 3.71 0 00-.24 2.79 3.77 3.77 0 00.31.7c.07.13.15.26.24.4.1.14.19.27.29.39l2 2.44-3 1.13a9.92 9.92 0 00-.94.44 5.79 5.79 0 00-2.59 2.57 3.57 3.57 0 00-.1 2.83 4.9 4.9 0 00.22.48 6.69 6.69 0 003.92 3z" fill="#01a1ff"/></svg>
            </a>
            <h1 class="text-xl font-semibold text-brand">${title}</h1>
          </header>
          <main class="overflow-auto max-h-[90vh]">
            ${children}
          </main>
        </div>
      </body>
    </html>
  `.trim();
};

export const printDatabases = ({ databases, req, port }: PrintDatabasesParams): string => {
  const rootUrl = `${req.protocol}://${req.hostname}:${port}`;
  const links = databases
    .map((d) => {
      const url = `${req.protocol}://${d.datname}.${req.hostname}:${port}`;
      return `<a href="${url}" class="text-brand hover:underline block">${d.datname}</a>`;
    })
    .join('');

  return printHtml({
    title: 'Databases',
    rootUrl,
    children: `
      <hr class="border-gray-300 mb-2" />
      ${links}
    `
  });
};

export const printSchemas = ({ dbName, schemas, req, hostname, port }: PrintSchemasParams): string => {
  const rootUrl = `${req.protocol}://${hostname}:${port}`;
  const links = schemas
    .map((d) => {
      const url = `${req.protocol}://${d.table_schema}.${req.hostname}:${port}/graphiql`;
      return `<a href="${url}" class="text-brand hover:underline block">${d.table_schema}</a>`;
    })
    .join('');

  return printHtml({
    title: `Schemas in ${dbName}`,
    rootUrl,
    children: `
      <a href="${rootUrl}" class="text-xs text-brand hover:underline mb-2 inline-block">&larr; Back to root</a>
      <hr class="border-gray-300 mb-2" />
      ${links}
    `
  });
};
