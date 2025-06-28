import { CLIOptions, Inquirerer, OptionValue } from 'inquirerer';
import { LaunchQLProject, exportMigrations } from '@launchql/core';
import { getEnvOptions, getGitConfigInfo } from '@launchql/types';
import { resolve } from 'path';
import { getRootPgPool } from 'pg-cache';

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const { email, username } = getGitConfigInfo();
  const cwd = argv.cwd ?? process.cwd();
  const project = new LaunchQLProject(cwd);

  project.ensureWorkspace();
  project.resetCwd(project.workspacePath);

  const options = getEnvOptions(); 

  const db = await getRootPgPool({
    database: 'postgres'
  });

  const databasesResult = await db.query(`
    SELECT datname FROM pg_catalog.pg_database
    WHERE datistemplate = FALSE AND datname NOT IN ('postgres')
      AND datname !~ '^pg_';
  `);

  let databases: OptionValue[];
  ({ databases } = await prompter.prompt(argv, [
    {
      type: 'checkbox',
      name: 'databases',
      message: 'Select a database',
      options: databasesResult.rows.map(row => row.datname),
      required: true
    }
  ]));

  const dbname = databases.filter(d=>d.selected).map(d=>d.value)[0];
  const selectedDb = await getRootPgPool({
    database: dbname
  });

  const dbsResult = await selectedDb.query(`
    SELECT id, name FROM collections_public.database;
  `);

  let database_ids: OptionValue[];
  ({ database_ids } = await prompter.prompt({} as any, [
    {
      type: 'checkbox',
      name: 'database_ids',
      message: 'Select database_id(s)',
      options: dbsResult.rows.map(db => db.name),
      required: true
    }
  ]));

  const dbInfo = {
    dbname,
    database_ids: database_ids.map(did =>
      dbsResult.rows.find(db => db.name === did.name)!.id
    )
  };

  const { author, extensionName, metaExtensionName } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'author',
      message: 'Project author',
      default: `${username} <${email}>`,
      required: true
    },
    {
      type: 'text',
      name: 'extensionName',
      message: 'Extension name',
      default: dbInfo.database_ids[0],
      required: true
    },
    {
      type: 'text',
      name: 'metaExtensionName',
      message: 'Meta extension name',
      default: 'svc',
      required: true
    }
  ]);

  const schemasResult = await selectedDb.query(
    `SELECT * FROM collections_public.schema WHERE database_id = $1`,
    [dbInfo.database_ids[0]]
  );

  const { schema_names } = await prompter.prompt({} as any, [
    {
      type: 'checkbox',
      name: 'schema_names',
      message: 'Select schema_name(s)',
      options: schemasResult.rows.map(s => s.schema_name),
      default: schemasResult.rows.map(s => s.schema_name),
      required: true
    }
  ]);

  const outdir = resolve(project.workspacePath, 'packages/');
  
  await exportMigrations({
    project,
    options,
    dbInfo,
    author,
    schema_names,
    outdir,
    extensionName,
    metaExtensionName
  });

  console.log(`

        |||
       (o o)
   ooO--(_)--Ooo-

✨ finished!
`);
};
