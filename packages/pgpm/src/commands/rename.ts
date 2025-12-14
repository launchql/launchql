import { PgpmPackage } from '@pgpmjs/core';
import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import path from 'path';

import { cliExitWithError } from '../utils/cli-error';

export default async (argv: Partial<ParsedArgs>, _prompter: Inquirerer) => {
  const cwd = (argv.cwd as string) || process.cwd();
  const to = (argv.to as string) || (argv._ && argv._[0] as string);
  if (!to) {
    await cliExitWithError('Missing new name. Use --to <name> or provide as positional argument.');
  }
  const dryRun = !!argv['dry-run'] || !!argv.dryRun;
  const syncPkg = !!argv['sync-pkg-name'] || !!argv.syncPkgName;
  const proj = new PgpmPackage(path.resolve(cwd));
  const res = proj.renameModule(to, { dryRun, syncPackageJsonName: syncPkg });
  if (dryRun) {
    console.log('Dry run');
  }
  if (res.changed.length > 0) {
    console.log('Changed:');
    for (const f of res.changed) console.log(`- ${f}`);
  } else {
    console.log('No changes');
  }
  if (res.warnings.length > 0) {
    console.log('Warnings:');
    for (const w of res.warnings) console.log(`- ${w}`);
  }
};
