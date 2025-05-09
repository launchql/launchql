var fuzzy = require('fuzzy');
import { readdir } from 'fs';
import { resolve as resolvePath, basename, dirname } from 'path';
import * as glob from 'glob';
import { sqitchPath } from './paths';

export const searchTables = (answers, input) => {
  input = input || '';
  return new Promise(async resolve => {
    const path = await sqitchPath();

    let { schema } = answers;
    if (!schema) {
      schema = '**';
    }

    const schemaDir = resolvePath(`${path}/deploy/schemas`);

    var tables;
    try {
      tables = glob.sync(`${schemaDir}/${schema}/tables/**/table.sql`);
    } catch (e) {
      tables = [];
    }

    var views;
    try {
      views = glob.sync(`${schemaDir}/${schema}/views/**/view.sql`);
    } catch (e) {
      views = [];
    }

    views = views.map(f => basename(dirname(f)));
    tables = tables.map(f => basename(dirname(f)));

    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, tables.concat(views));
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, 25);
  });
};
