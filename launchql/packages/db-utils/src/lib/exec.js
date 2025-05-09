import { exec as shellExec } from 'shelljs';
import { PGUSER, PGPASSWORD, PGHOST, PGPORT } from '@launchql/db-env';

export const execSync = (cmd, opts) => {
  shellExec(cmd, {
    env: {
      ...process.env,
      PGUSER,
      PGPASSWORD,
      PGHOST,
      PGPORT
    },
    ...opts
  });
};
