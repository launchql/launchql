import requestLib from 'request';
import type { JobRow } from '@launchql/core';
import type { JobExecutor } from '../index';
import {
  getOpenFaasGatewayConfig,
  getOpenFaasDevMap,
  getNodeEnvironment,
} from '@launchql/job-utils';

const { gatewayUrl } = getOpenFaasGatewayConfig();
const isProd = getNodeEnvironment() === 'production';
const DEV_MAP = !isProd ? getOpenFaasDevMap() : null;

const getFunctionUrl = (fn: string, fallbackCallbackUrl: string): string => {
  if (DEV_MAP) {
    const mapped = (DEV_MAP as Record<string, string>)[fn];
    if (mapped) return mapped;
    return fallbackCallbackUrl; // dev shortcut: post to callback when unmapped
  }
  return `${gatewayUrl}/async-function/${fn}`;
};

export class OpenFaasJobExecutor implements JobExecutor {
  async execute(job: JobRow, headers: Record<string, string>): Promise<void> {
    const url = getFunctionUrl(job.task_identifier, headers['x-callback-url']);
    await new Promise<void>((resolve, reject) => {
      requestLib.post(
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Worker-Id': headers['x-worker-id'],
            'X-Job-Id': headers['x-job-id'],
            'X-Database-Id': headers['x-database-id'],
            'X-Callback-Url': headers['x-callback-url'],
          },
          url,
          json: true,
          body: job.payload ?? {},
        },
        (error) => (error ? reject(error) : resolve())
      );
    });
  }
}

