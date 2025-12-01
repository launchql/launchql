export interface JobRow {
  id: number;
  database_id: string; // uuid
  queue_name: string | null;
  task_identifier: string;
  payload: any; // JSON
  priority: number;
  run_at: string; // timestamptz
  attempts: number;
  max_attempts: number;
  key: string | null;
  last_error: string | null;
  locked_at: string | null; // timestamptz
  locked_by: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ScheduledJobRow {
  id: number;
  database_id: string; // uuid
  queue_name: string | null;
  task_identifier: string;
  payload: any; // JSON
  schedule_info: any; // JSON
  priority: number;
  max_attempts: number;
  key: string | null;
  locked_at: string | null; // timestamptz
  locked_by: string | null;
  last_scheduled: string | null;
  last_scheduled_id: number | null;
}

export interface GetJobOptions {
  workerId: string;
  supportedTaskNames?: string[] | null; // null means any
  jobExpiryInterval?: string; // e.g., '4 hours'
  schema?: string; // default 'app_jobs'
}

export interface GetScheduledJobOptions {
  workerId: string;
  supportedTaskNames?: string[] | null; // null means any
  schema?: string; // default 'app_jobs'
}

export interface CompleteJobOptions {
  workerId: string;
  jobId: number | string;
  schema?: string;
}

export interface FailJobOptions extends CompleteJobOptions {
  message: string;
}

export interface AddJobOptions {
  databaseId: string; // uuid
  identifier: string; // task_identifier
  payload?: any;
  jobKey?: string | null;
  queueName?: string | null;
  runAt?: string | null; // timestamptz
  maxAttempts?: number | null;
  priority?: number | null;
  schema?: string;
}

export interface AddScheduledJobOptions {
  databaseId: string; // uuid
  identifier: string;
  payload?: any;
  scheduleInfo?: any;
  jobKey?: string | null;
  queueName?: string | null;
  maxAttempts?: number | null;
  priority?: number | null;
  schema?: string;
}

export interface RunScheduledJobOptions {
  jobId: number | string;
  jobExpiryInterval?: string; // default '1 hours' in SQL
  schema?: string;
}

export interface ReleaseScheduledJobsOptions {
  workerId: string;
  ids?: Array<number | string> | null;
  schema?: string;
}

export interface ReleaseJobsOptions {
  workerId: string;
  schema?: string;
}

