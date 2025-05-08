import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 })
});
