declare module 'pg' {
  export class Client {
    constructor(connectionString: string);
    connect(): Promise<void>;
    query(...args: any[]): Promise<any>;
    end(): Promise<void>;
  }
}

declare module 'async-retry';
declare module 'node-schedule';
declare module 'request';

declare module '@launchql/job-pg';
declare module '@launchql/job-utils';
declare module '@launchql/job-scheduler';
declare module '@launchql/knative-job-worker';
declare module '@launchql/knative-job-server';
declare module '@launchql/knative-job-service';
declare module '@launchql/knative-job-fn';
declare module '@launchql/knative-job-example';
