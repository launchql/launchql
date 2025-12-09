declare module 'pg' {
  const Pg: any;
  export default Pg;
}

declare module 'async-retry';
declare module 'node-schedule';
declare module 'request';
declare module 'express';
declare module 'body-parser';
declare module '@launchql/mjml';
declare module '@launchql/postmaster';

declare module '@launchql/job-pg';
declare module '@launchql/job-utils';
declare module '@launchql/job-scheduler';
declare module '@launchql/knative-job-worker';
declare module '@launchql/knative-job-server';
declare module '@launchql/knative-job-service';
declare module '@launchql/knative-job-fn';
declare module '@launchql/knative-job-example';
