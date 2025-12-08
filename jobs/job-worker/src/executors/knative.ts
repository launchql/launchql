import type { JobRow } from '@launchql/core';
import type { JobExecutor } from '../index';
import { getCallbackBaseUrl } from '@launchql/job-utils';

const getNamespace = (): string =>
  process.env.KNATIVE_NAMESPACE || process.env.JOBS_NAMESPACE || 'default';

const getCallbackUrl = (): string => getCallbackBaseUrl();

const buildServiceUrl = (fn: string, ns: string): string =>
  `http://${fn}.${ns}.svc.cluster.local/`;

export class KnativeJobExecutor implements JobExecutor {
  constructor(private namespace: string = getNamespace()) {}

  async execute(job: JobRow, headers: Record<string, string>): Promise<void> {
    const url = buildServiceUrl(job.task_identifier, this.namespace);
    const callbackUrl = headers['x-callback-url'] || getCallbackUrl();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
        'x-callback-url': callbackUrl,
      } as any,
      body: JSON.stringify(job.payload ?? {}),
    } as any);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Knative function call failed: ${res.status} ${text}`);
    }
  }
}
