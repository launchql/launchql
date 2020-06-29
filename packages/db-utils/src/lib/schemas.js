var fuzzy = require('fuzzy');
import { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';
import { sqitchPath } from './paths';

export const searchSchemas = (answers, input) => {
  input = input || '';
  return new Promise(async resolve => {
    const path = await sqitchPath();
    var dirs;
    try {
      dirs = await promisify(readdir)(resolvePath(path + '/deploy/schemas'));
    } catch (e) {
      dirs = [];
    }

    dirs = dirs.filter(f => f !== '.DS_Store');

    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, dirs);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, 25);
  });
};
