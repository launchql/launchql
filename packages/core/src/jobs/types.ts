export interface JobRow {
  id: number | string;
  database_id: string | null; // uuid
  queue_name?: string | null;
  task_identifier: string; // corresponds to task/function name
  payload: any; // JSON
  priority?: number;
  run_at?: string | Date;
  attempts?: number;
  max_attempts?: number;
  key?: string | null;
  last_error?: string | null;
  locked_at?: string | Date | null;
  locked_by?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

export interface ScheduledJobRow {
  id: number | string;
  database_id: string | null;
  queue_name?: string | null;
  task_identifier: string;
  payload: any;
  schedule_info: any;
  priority?: number;
  max_attempts?: number;
  key?: string | null;
  locked_at?: string | Date | null;
  locked_by?: string | null;
  last_scheduled?: string | Date | null;
  last_scheduled_id?: number | string | null;
}

export interface GetJobOptions {
  workerId: string;
  supportedTaskNames?: string[] | null; // null => any
  jobExpiryInterval?: string; // e.g. '4 hours'
  schema?: string; // default app_jobs
}

export interface GetScheduledJobOptions {
  workerId: string;
  supportedTaskNames?: string[] | null; // null => any
  schema?: string;
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
  identifier: string;
  payload?: any;
  jobKey?: string | null;
  queueName?: string | null;
  runAt?: string | null;
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
  jobExpiryInterval?: string;
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

