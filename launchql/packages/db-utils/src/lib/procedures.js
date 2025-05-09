var fuzzy = require('fuzzy');
import { readdir } from 'fs';
import { resolve as resolvePath, basename, dirname } from 'path';
import * as glob from 'glob';
import { sqitchPath } from './paths';

export const searchProcedures = (answers, input) => {
  input = input || '';
  return new Promise(async (resolve, reject) => {
    const path = await sqitchPath();

    let { schema } = answers;
    if (!schema) {
      schema = '**';
    }

    var procs;

    const schemaDir = resolvePath(`${path}/deploy/schemas`);

    try {
      procs = glob.sync(`${schemaDir}/${schema}/procedures/**.sql`);
    } catch (e) {
      procs = [];
    }
    procs = procs.map(f => basename(f).replace('.sql', ''));

    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, procs);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, 25);
  });
};
