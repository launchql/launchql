#!/usr/bin/env node
// @ts-nocheck
import { prompt } from '@pyramation/prompt';
import { readConfig } from './parse';
import { Parser } from './parser';
import { normalizePath } from './utils';
import { dirname } from 'path';
import { writeFileSync } from 'fs';

const argv = process.argv.slice(2);

(async () => {
  let { config } = await prompt(
    [
      {
        _: true,
        name: 'config',
        type: 'config',
        required: true
      }
    ],
    argv
  );

  config = normalizePath(config);
  const dir = dirname(config);
  config = readConfig(config);

  if (config.input) {
    if (!argv.includes('--input')) {
      argv.push('--input');
      config.input = normalizePath(config.input, dir);
      argv.push(config.input);
    }
  }
  if (config.output) {
    if (!argv.includes('--output')) {
      argv.push('--output');
      config.output = normalizePath(config.output, dir);
      argv.push(config.output);
    }
  }

  const results = await prompt(
    [
      {
        name: 'input',
        type: 'path',
        required: true
      },
      {
        name: 'output',
        type: 'path',
        required: true
      }
    ],
    argv
  );

  config.input = results.input;

  let outFile = results.output;
  if (!outFile.endsWith('.sql')) outFile = outFile + '.sql';

  if (argv.includes('--debug')) {
    config.debug = true;
  }

  const parser = new Parser(config);
  const sql = await parser.parse();

  writeFileSync(config.output, sql);
})();
