export interface UpdateCheckConfig {
  lastCheckedAt?: number;
  latestKnownVersion?: string;
  lastPromptedVersion?: string;
}

export const UPDATE_CHECK_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
export const UPDATE_CHECK_APPSTASH_KEY = 'pgpm-update-check';
