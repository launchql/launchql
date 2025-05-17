import deepmerge from 'deepmerge';
import { getMergedOptions, LaunchQLOptions, PgConfig } from './launchql';

const parseEnvNumber = (val?: string): number | undefined => {
    const num = Number(val);
    return !isNaN(num) ? num : undefined;
};

const parseEnvBoolean = (val?: string): boolean | undefined => {
    if (val === undefined) return undefined;
    return ['true', '1', 'yes'].includes(val.toLowerCase());
};

export const getEnvOptions = (overrides: LaunchQLOptions = {}): LaunchQLOptions => {
    const envOpts = getEnvVars();
    return getMergedOptions
        ({
            ...envOpts,
            ...overrides,
        });
};

export const getPgEnvOptions = (overrides: Partial<PgConfig> = {}): PgConfig => {
    const envOpts = getPgEnvVars();
    const options = deepmerge(envOpts, overrides);
    // if you need to sanitize...
    return options;
};

const getEnvVars = (): LaunchQLOptions => {
    const {
        PORT,
        SERVER_HOST,
        SERVER_TRUST_PROXY,
        SERVER_ORIGIN,
        SERVER_STRICT_AUTH,

        PGHOST,
        PGPORT,
        PGUSER,
        PGPASSWORD,
        PGDATABASE,

        FEATURES_SIMPLE_INFLECTION,
        FEATURES_OPPOSITE_BASE_NAMES,
        FEATURES_POSTGIS,

        BUCKET_NAME,
        AWS_REGION,
        AWS_ACCESS_KEY,
        AWS_SECRET_KEY,
        MINIO_ENDPOINT,
    } = process.env;

    return {
        server: {
            ...(PORT && { port: parseEnvNumber(PORT) }),
            ...(SERVER_HOST && { host: SERVER_HOST }),
            ...(SERVER_TRUST_PROXY && { trustProxy: parseEnvBoolean(SERVER_TRUST_PROXY) }),
            ...(SERVER_ORIGIN && { origin: SERVER_ORIGIN }),
            ...(SERVER_STRICT_AUTH && { strictAuth: parseEnvBoolean(SERVER_STRICT_AUTH) }),
        },
        pg: {
            ...(PGHOST && { host: PGHOST }),
            ...(PGPORT && { port: parseEnvNumber(PGPORT) }),
            ...(PGUSER && { user: PGUSER }),
            ...(PGPASSWORD && { password: PGPASSWORD }),
            ...(PGDATABASE && { database: PGDATABASE }),
        },
        features: {
            ...(FEATURES_SIMPLE_INFLECTION && { simpleInflection: parseEnvBoolean(FEATURES_SIMPLE_INFLECTION) }),
            ...(FEATURES_OPPOSITE_BASE_NAMES && { oppositeBaseNames: parseEnvBoolean(FEATURES_OPPOSITE_BASE_NAMES) }),
            ...(FEATURES_POSTGIS && { postgis: parseEnvBoolean(FEATURES_POSTGIS) }),
        },
        cdn: {
            ...(BUCKET_NAME && { bucketName: BUCKET_NAME }),
            ...(AWS_REGION && { awsRegion: AWS_REGION }),
            ...(AWS_ACCESS_KEY && { awsAccessKey: AWS_ACCESS_KEY }),
            ...(AWS_SECRET_KEY && { awsSecretKey: AWS_SECRET_KEY }),
            ...(MINIO_ENDPOINT && { minioEndpoint: MINIO_ENDPOINT }),
        }
    };
};

const getPgEnvVars = (): PgConfig => {
    const {
        PGHOST,
        PGPORT,
        PGUSER,
        PGPASSWORD,
        PGDATABASE
    } = process.env;

    return {
        ...(PGHOST && { host: PGHOST }),
        ...(PGPORT && { port: parseEnvNumber(PGPORT) }),
        ...(PGUSER && { user: PGUSER }),
        ...(PGPASSWORD && { password: PGPASSWORD }),
        ...(PGDATABASE && { database: PGDATABASE }),
    };
};
