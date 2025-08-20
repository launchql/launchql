import { Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import path from 'path';
import { LaunchQLPackage } from '@launchql/core';

export default async (argv: Partial<ParsedArgs>, _prompter: Inquirerer) => {
  const cwd = (argv.cwd as string) || process.cwd();
  const proj = new LaunchQLPackage(path.resolve(cwd));
  const result = proj.analyzeModule();
  if (result.ok) {
    console.log(`OK ${result.name}`);
    return;
  }
  console.log(`NOT OK ${result.name}`);
  for (const issue of result.issues) {
    const loc = issue.file ? ` (${issue.file})` : '';
    console.log(`- [${issue.code}] ${issue.message}${loc}`);
  }
};
