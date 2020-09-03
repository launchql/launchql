import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

import createDatabase from './commands/create/database';
import createField from './commands/create/field';
import createTable from './commands/create/table';
import createModule from './commands/create/module';
import createRelation from './commands/create/relation';
import createUnique from './commands/create/unique';
import createPrimary from './commands/create/primary';

import updateField from './commands/update/field';
import updateTable from './commands/update/table';
import updateDatabase from './commands/update/database';

import deleteField from './commands/delete/field';
import deleteTable from './commands/delete/table';
import deleteDatabase from './commands/delete/database';

import exportDatabase from './commands/export/database';

import listDatabases from './commands/list/databases';
import listSchemata from './commands/list/schemata';
import listTables from './commands/list/tables';
import listFields from './commands/list/fields';

import configCreds from './commands/config/set-credentials';
import configServer from './commands/config/set-server';
import configContext from './commands/config/use-context';
import configView from './commands/config/view';
import configCreate from './commands/config/create';

// later make this generated from folders/files nested
export const functions = {
  config: {
    create: configCreate,
    user: configCreds,
    server: configServer,
    context: configContext,
    view: configView
  },
  create: {
    primaryKey: createPrimary,
    uniqueKey: createUnique,
    relation: createRelation,
    module: createModule,
    field: createField,
    table: createTable,
    database: createDatabase
  },
  delete: {
    field: deleteField,
    table: deleteTable,
    database: deleteDatabase
  },
  update: {
    field: updateField,
    database: updateDatabase,
    table: updateTable
  },
  export: {
    database: exportDatabase
  },
  list: {
    fields: listFields,
    tables: listTables,
    databases: listDatabases,
    schemata: listSchemata
  }
};

export const questions = Object.keys(functions).reduce((m, v) => {
  const srch = Object.keys(functions[v]);
  if (srch.length) {
    m[v] = [
      {
        _: true,
        type: 'autocomplete',
        name: 'action',
        message: 'which action?',
        source: makeSearch(srch)
      }
    ];
  }

  return m;
}, {});

export const objects = Object.keys(questions);
