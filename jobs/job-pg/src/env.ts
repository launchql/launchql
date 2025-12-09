import { getJobPgConfig } from '@launchql/job-utils';
import type { PgConfig } from 'pg-env';

const pgConfig: PgConfig = getJobPgConfig();
export default pgConfig;
