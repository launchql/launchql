#!/usr/bin/env node
import { prompt } from 'inquirerer';
import { sqitchPath } from '@launchql/db-utils';
import * as shell from 'shelljs';

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp').sync;

const promisify = require('util').promisify;
const glob = promisify(require('glob'));

const exec = require('child_process').exec;
const asyncExec = promisify(exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const questions = [
  {
    _: true,
    name: 'filter',
    message: 'choose a filter, e.g, schemas/users',
    required: true
  }
];

export default async (argv) => {
  const PKGDIR = await sqitchPath();

  let { filter } = await prompt(questions, argv);

  filter = sanitize_path(filter);

  function sanitize_path(fullpath) {
    function constructPath(pathArray) {
      return pathArray.length ? pathArray.join('/') : '';
    }

    // TODO: NOT DRY
    function createPathArray(str) {
      return str.split('/').filter((f) => f);
    }

    return constructPath(createPathArray(fullpath));
  }

  const files = await glob(`${PKGDIR}/**/**.sql`);

  for (var i = 0; i < files.length; i++) {
    const data = await readFile(files[i]);
    if (!files[i].match(filter)) continue;
    if (!/plv8/.test(data)) {
      const { stdout } = await asyncExec(`pg_format ${files[i]}`);
      await writeFile(files[i], stdout);
    }
  }
};
