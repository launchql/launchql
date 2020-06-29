import { exec as shellExec } from 'shelljs';
import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PATH } from './node_modules/@launchql/db-env';

export const execSync = (cmd, opts) => {
  shellExec(cmd, {
    env: {
      PGUSER,
      PGPASSWORD,
      PGHOST,
      PGPORT,
      PATH
    },
    ...opts
  });
};
