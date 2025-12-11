/**
 * Metadata stored for npm update checks.
 */
export interface UpdateCheckConfig {
  lastCheckedAt: number;
  latestKnownVersion: string;
}

export const UPDATE_CHECK_TTL_MS = 24 * 60 * 60 * 1000;
export const UPDATE_CHECK_APPSTASH_KEY = 'pgpm-update-check';
export const UPDATE_PACKAGE_NAME = 'pgpm';
