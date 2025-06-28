import { ParsedArgs } from 'minimist';

export const extractFirst = (argv: Partial<ParsedArgs>) => {
  const first = argv._?.[0];
  const newArgv = {
    ...argv,
    _: argv._?.slice(1) ?? []
  };
  return { first, newArgv };
};