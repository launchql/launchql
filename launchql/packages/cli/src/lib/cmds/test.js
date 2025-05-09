import { random, execSync } from '@launchql/db-utils';
import { prompt } from 'inquirerer';
export default async (argv) => {
  const db = 'test-db-' + random();

  execSync(`createdb ${db}`);
  execSync(`sqitch deploy db:pg:${db}`);

  if (argv.verify) {
    execSync(`sqitch verify db:pg:${db}`);
  }
};
