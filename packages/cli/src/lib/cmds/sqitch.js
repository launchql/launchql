import * as shell from 'shelljs';
import { readFileSync, writeFileSync } from 'fs';
import { prompt } from 'inquirerer';
import { dirname, basename, resolve } from 'path';
import { sync as glob } from 'glob';

export default async (argv) => {
  const native = [];

  const usePath = process.cwd();

  const extensions = glob(usePath + '/**/*.control').reduce((m, v) => {
    const contents = readFileSync(v).toString();
    const key = basename(v).split('.control')[0];
    m[key] = {};
    m[key] = { path: v };
    m[key].requires = contents
      .split('\n')
      .find((el) => /^requires/.test(el))
      .split('=')[1]
      .split(',')
      .map((el) => el.replace(/[\'\s]*/g, '').trim());
    // m[key].version = contents
    //                   .split('\n')
    //                   .find(el=>/^default_version/.test(el))
    //                   .split('=')[1]
    //                   .replace(/[\']*/g, '')
    //                   .trim()
    //                   ;
    // m[key].sql = readFileSync(resolve(`${dirname(v)}/sql/${key}--${m[key].version}.sql`)).toString().split('\n').filter((l, i)=>i!==0).join('\n');
    // m[key].plan = readFileSync(resolve(`${dirname(v)}/sqitch.plan`)).toString();
    m[key].sqitchPath = dirname(v);

    return m;
  }, {});

  const deps = Object.keys(extensions).reduce((m, k) => {
    m[k] = extensions[k].requires;
    return m;
  }, {});

  // https://www.electricmonk.nl/log/2008/08/07/dependency-resolving-algorithm/
  function dep_resolve(sqlmodule, resolved, unresolved) {
    unresolved.push(sqlmodule);
    let edges = deps[sqlmodule];
    if (!edges) {
      native.push(sqlmodule);
      edges = deps[sqlmodule] = [];
    }
    for (let i = 0; i < edges.length; i++) {
      const dep = edges[i];
      if (!resolved.includes(dep)) {
        if (unresolved.includes(dep)) {
          throw new Error(`Circular reference detected ${sqlmodule}, ${dep}`);
        }
        dep_resolve(dep, resolved, unresolved);
      }
    }
    resolved.push(sqlmodule);
    const index = unresolved.indexOf(sqlmodule);
    unresolved.splice(index);
  }

  const resolved = [];
  const unresolved = [];

  const questions = [
    {
      _: true,
      type: 'list',
      name: 'dep',
      message: 'choose a dep',
      choices: Object.keys(extensions),
      required: true
    },
    {
      _: true,
      name: 'path',
      message: 'choose a name',
      filter: (val) => {
        val = /.sh$/.test(val) ? val : val + '.sh';
        return resolve(usePath + '/' + val);
      },
      required: true
    },
    {
      _: true,
      name: 'database',
      message: 'database',
      required: true
    }
  ];

  const { dep, path, database } = await prompt(questions, argv);

  dep_resolve(dep, resolved, unresolved);

  const sh = [
    '#!/bin/bash',
    'export PGUSER=postgres;',
    'export PGHOST=localhost;',
    'export PGPASSWORD=password;',
    `export DATABASE="${database}";`,
    `createdb "$DATABASE";`
  ];

  resolved.forEach((extension) => {
    if (native.includes(extension)) {
      sh.push(
        `psql --dbname "$DATABASE" -c 'CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;'`
      );
    } else {
      // sh.push(`SQITCH_PATH=${extensions[extension].sqitchPath}`);
      // sh.push(`SQITCH_PATH=${extensions[extension].sqitchPath} skitch deploy`);
      // shell.exec(`PGUSER=postgres PGHOST=localhost sqitch deploy db:pg:${db}`);
      // shell.exec(`cd ${}`);
      // NOTE just local right now
      sh.push(`cd ${extensions[extension].sqitchPath}`);
      sh.push(`sqitch deploy db:pg:$DATABASE`);
    }
  });

  writeFileSync(path, sh.join('\n'));
};
