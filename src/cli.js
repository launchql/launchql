#!/usr/bin/env node

import { prompt } from '@pyramation/prompt';
import { parse } from './parse';

const argv = process.argv.slice(2);

// - [ ] option to rename fields
// - [ ] option to set table name
// - [ ] option to cast certain props
// - [ ] option to specify unique fields for on conflict updates

(async () => {
  const { path } = await prompt(
    [
      {
        _: true,
        name: 'path',
        type: 'path',
        required: true
      }
    ],
    argv
  );

  const parsed = await parse(path);
  console.log(parsed);
})();
