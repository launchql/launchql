import { Timestamp, UUID } from "./_common";
export interface job_queues {
  queue_name: string;
  job_count: number;
  locked_at: Timestamp | null;
  locked_by: string | null;
}
export interface jobs {
  id: number;
  database_id: UUID;
  queue_name: string | null;
  task_identifier: string;
  payload: any;
  priority: number;
  run_at: Timestamp;
  attempts: number;
  max_attempts: number;
  key: string | null;
  last_error: string | null;
  locked_at: Timestamp | null;
  locked_by: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface scheduled_jobs {
  id: number;
  database_id: UUID;
  queue_name: string | null;
  task_identifier: string;
  payload: any;
  priority: number;
  max_attempts: number;
  key: string | null;
  locked_at: Timestamp | null;
  locked_by: string | null;
  schedule_info: any;
  last_scheduled: Timestamp | null;
  last_scheduled_id: number | null;
}