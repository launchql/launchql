import { getEnvOptions, getNodeEnv } from '@launchql/env';
import { defaultPgConfig, getPgEnvVars, PgConfig } from 'pg-env';
import { getPgPool } from 'pg-cache';

type Boolish = string | undefined;

const toBool = (v: Boolish): boolean | undefined => {
  if (v == null) return undefined;
  const s = String(v).toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(s)) return true;
  if (['false', '0', 'no', 'n'].includes(s)) return false;
  return undefined;
};

const toStrArray = (v?: string): string[] | undefined =>
  v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

// ---- PG config ----
export const getJobPgConfig = (): PgConfig => {
  const opts = getEnvOptions();
  const envOnly = getPgEnvVars();
  return {
    ...defaultPgConfig,
    ...(opts.pg ?? {}),
    ...(opts.jobs?.pg ?? {}),
    ...envOnly
  } as PgConfig;
};

export const getJobPool = () => getPgPool(getJobPgConfig());

// ---- Schema ----
export const getJobSchema = (): string => {
  const opts = getEnvOptions();
  const fromOpts = opts.jobs?.schema?.schema;
  const fromEnv = process.env.JOBS_SCHEMA;
  return (fromEnv || fromOpts || 'app_jobs') as string;
};

// ---- SupportAny / Supported ----
export const getJobSupportAny = (): boolean => {
  const opts = getEnvOptions();
  const envVal = toBool(process.env.JOBS_SUPPORT_ANY);
  if (typeof envVal === 'boolean') return envVal;
  const worker = opts.jobs?.worker?.supportAny;
  const scheduler = opts.jobs?.scheduler?.supportAny;
  return (worker ?? scheduler ?? true) as boolean;
};

export const getJobSupported = (): string[] => {
  const opts = getEnvOptions();
  const envVal = toStrArray(process.env.JOBS_SUPPORTED);
  if (envVal) return envVal;
  const worker = opts.jobs?.worker?.supported;
  const scheduler = opts.jobs?.scheduler?.supported;
  return (worker ?? scheduler ?? []) as string[];
};

// ---- Hostnames ----
export const getWorkerHostname = (): string => {
  const opts = getEnvOptions();
  return (
    process.env.HOSTNAME ||
    opts.jobs?.worker?.hostname ||
    'worker-0'
  );
};

export const getSchedulerHostname = (): string => {
  const opts = getEnvOptions();
  return (
    process.env.HOSTNAME ||
    opts.jobs?.scheduler?.hostname ||
    'scheduler-0'
  );
};

// ---- OpenFaaS Gateway / Callback ----
export interface GatewayConfig {
  gatewayUrl: string;
  callbackUrl: string;
  callbackPort: number;
}

export const getOpenFaasGatewayConfig = (): GatewayConfig => {
  const opts = getEnvOptions();
  const gateway = opts.jobs?.openFaas?.gateway ?? {};
  const envCbPort = Number(process.env.INTERNAL_JOBS_CALLBACK_PORT);
  return {
    gatewayUrl: process.env.INTERNAL_GATEWAY_URL || gateway.gatewayUrl || 'http://gateway:8080',
    callbackUrl: process.env.INTERNAL_JOBS_CALLBACK_URL || gateway.callbackUrl || 'http://callback:12345',
    callbackPort: Number.isFinite(envCbPort) && envCbPort > 0 ? envCbPort : (gateway.callbackPort ?? 12345)
  };
};

export const getOpenFaasDevMap = (): Record<string, string> | null => {
  const map = process.env.INTERNAL_GATEWAY_DEVELOPMENT_MAP;
  if (!map) return null;
  try {
    return JSON.parse(map);
  } catch {
    return null;
  }
};

export const getNodeEnvironment = getNodeEnv;

