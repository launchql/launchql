const fs = require('fs');

import { getDeps } from './deps';

export const resolve = async (
  pkgDir = process.cwd(),
  scriptType = 'deploy'
) => {
  const sqlfile = [];

  let { resolved, external } = await getDeps(pkgDir);

  if (scriptType === 'revert') {
    resolved = resolved.reverse();
  }

  for (var i = 0; i < resolved.length; i++) {
    if (external.includes(resolved[i])) continue;
    const file = `${pkgDir}/${scriptType}/${resolved[i]}.sql`;
    const dscript = fs.readFileSync(file, 'utf-8');
    sqlfile.push(dscript);
  }

  return sqlfile.join('\n');
};

export const resolveWithPlan = async (
  pkgDir = process.cwd(),
  scriptType = 'deploy'
) => {
  const sqlfile = [];

  const plan = fs.readFileSync(`${pkgDir}/sqitch.plan`, 'utf-8');

  let resolved = plan
    .split('\n')
    .filter(
      (l) =>
        l.trim().length > 0 && // empty lines
        !l.trim().startsWith('%') && // initial project settings
        !l.trim().startsWith('@') // tags
    )
    .map((line) => line.split(' ')[0]);

  if (scriptType === 'revert') {
    resolved = resolved.reverse();
  }

  for (var i = 0; i < resolved.length; i++) {
    const file = `${pkgDir}/${scriptType}/${resolved[i]}.sql`;
    const dscript = fs.readFileSync(file, 'utf-8');
    sqlfile.push(dscript);
  }

  return sqlfile.join('\n');
};
