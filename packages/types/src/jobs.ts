import { PgConfig } from 'pg-env';

/**
 * Job system PostgreSQL configuration
 * Extends the base PgConfig with job-specific database settings
 */
export interface JobPgConfig extends PgConfig {
  /** Database name for job system (defaults to 'jobs') */
  database: string;
}

/**
 * Job schema configuration
 */
export interface JobSchemaConfig {
  /** PostgreSQL schema name for job tables and functions (defaults to 'app_jobs') */
  schema: string;
}

/**
 * Worker/Scheduler hostname configuration
 */
export interface JobHostnameConfig {
  /** Unique identifier for the worker or scheduler instance */
  hostname: string;
}

/**
 * Job task support configuration
 */
export interface JobTaskSupportConfig {
  /** Whether to support any/all task types (defaults to true) */
  supportAny: boolean;
  /** Array of explicitly supported task names */
  supported: string[];
}

/**
 * OpenFaaS job system gateway configuration
 */
export interface JobGatewayConfig {
  /** Internal gateway URL for OpenFaaS function calls */
  gatewayUrl: string;
  /** Callback URL for job completion notifications */
  callbackUrl: string;
  /** Port for internal job callback server (defaults to 12345) */
  callbackPort: number;
}

/**
 * Parameters for failing a job
 */
export interface FailJobParams {
  /** Worker ID that is failing the job */
  workerId: string;
  /** Job ID to fail */
  jobId: number | string;
  /** Error message or reason for failure */
  message: string;
}

/**
 * Parameters for completing a job
 */
export interface CompleteJobParams {
  /** Worker ID that completed the job */
  workerId: string;
  /** Job ID to mark as complete */
  jobId: number | string;
}

/**
 * Parameters for getting a job from the queue
 */
export interface GetJobParams {
  /** Worker ID requesting a job */
  workerId: string;
  /** Array of task names this worker supports */
  supportedTaskNames: string[];
}

/**
 * Parameters for getting a scheduled job
 */
export interface GetScheduledJobParams {
  /** Worker ID requesting a scheduled job */
  workerId: string;
  /** Array of task names this worker supports */
  supportedTaskNames: string[];
}

/**
 * Parameters for running a scheduled job
 */
export interface RunScheduledJobParams {
  /** Job ID to run */
  jobId: number | string;
}

/**
 * Parameters for releasing scheduled jobs
 */
export interface ReleaseScheduledJobsParams {
  /** Worker ID releasing the jobs */
  workerId: string;
  /** Array of job IDs to release */
  ids: Array<number | string>;
}

/**
 * Parameters for releasing all jobs held by a worker
 */
export interface ReleaseJobsParams {
  /** Worker ID releasing all its jobs */
  workerId: string;
}

/**
 * Job record structure from database
 */
export interface Job {
  /** Unique job identifier */
  id: number | string;
  /** Task name/type for this job */
  task_name: string;
  /** JSON payload data for the job */
  payload?: any;
  /** Worker ID currently assigned to this job */
  worker_id?: string;
  /** Maximum number of retry attempts */
  max_attempts?: number;
  /** Current attempt number */
  attempts?: number;
  /** Priority level for job execution */
  priority?: number;
  /** Timestamp when job was created */
  created_at?: Date | string;
  /** Timestamp when job was last updated */
  updated_at?: Date | string;
  /** Timestamp when job should run (for scheduled jobs) */
  run_at?: Date | string;
  /** Last error message if job failed */
  last_error?: string;
}

/**
 * Worker configuration options
 */
export interface JobWorkerConfig extends JobPgConfig, JobSchemaConfig, JobHostnameConfig, JobTaskSupportConfig {
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Whether to enable graceful shutdown */
  gracefulShutdown?: boolean;
}

/**
 * Scheduler configuration options
 */
export interface JobSchedulerConfig extends JobPgConfig, JobSchemaConfig, JobHostnameConfig, JobTaskSupportConfig {
  /** Polling interval in milliseconds for checking scheduled jobs */
  pollInterval?: number;
  /** Whether to enable graceful shutdown */
  gracefulShutdown?: boolean;
}

/**
 * OpenFaaS worker configuration
 */
export interface OpenFaasJobWorkerConfig extends JobWorkerConfig, JobGatewayConfig {}

/**
 * OpenFaaS server configuration
 */
export interface OpenFaasJobServerConfig extends JobSchemaConfig {
  /** Port for the job server */
  port: number;
  /** Host address for the job server */
  host?: string;
}

/**
 * Complete job system configuration
 */
export interface JobsConfig {
  /** PostgreSQL database configuration */
  pg?: Partial<JobPgConfig>;
  /** Job schema configuration */
  schema?: Partial<JobSchemaConfig>;
  /** Worker configuration */
  worker?: Partial<JobWorkerConfig>;
  /** Scheduler configuration */
  scheduler?: Partial<JobSchedulerConfig>;
  /** OpenFaaS specific configuration */
  openFaas?: {
    /** OpenFaaS worker config */
    worker?: Partial<OpenFaasJobWorkerConfig>;
    /** OpenFaaS server config */
    server?: Partial<OpenFaasJobServerConfig>;
    /** Gateway config */
    gateway?: Partial<JobGatewayConfig>;
  };
}

/**
 * Default configuration values for job system
 */
export const jobsDefaults: JobsConfig = {
  pg: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'jobs'
  },
  schema: {
    schema: 'app_jobs'
  },
  worker: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'jobs',
    schema: 'app_jobs',
    hostname: 'worker-0',
    supportAny: true,
    supported: [],
    pollInterval: 1000,
    gracefulShutdown: true
  },
  scheduler: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'jobs',
    schema: 'app_jobs',
    hostname: 'scheduler-0',
    supportAny: true,
    supported: [],
    pollInterval: 1000,
    gracefulShutdown: true
  },
  openFaas: {
    gateway: {
      gatewayUrl: 'http://gateway:8080',
      callbackUrl: 'http://callback:12345',
      callbackPort: 12345
    },
    server: {
      schema: 'app_jobs',
      port: 3000,
      host: 'localhost'
    }
  }
};
