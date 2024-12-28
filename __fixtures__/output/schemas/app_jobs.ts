import { Timestamp, UUID } from "./_common";
export interface job_queues {
  queue_name: string;
  job_count: number;
  locked_at: Timestamp | null;
  locked_by: string | null;
}
export class job_queues implements job_queues {
  queue_name: string;
  job_count: number;
  locked_at: Timestamp | null;
  locked_by: string | null;
  constructor(data: job_queues) {
    this.queue_name = data.queue_name;
    this.job_count = data.job_count;
    this.locked_at = data.locked_at;
    this.locked_by = data.locked_by;
  }
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
export class jobs implements jobs {
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
  constructor(data: jobs) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.queue_name = data.queue_name;
    this.task_identifier = data.task_identifier;
    this.payload = data.payload;
    this.priority = data.priority;
    this.run_at = data.run_at;
    this.attempts = data.attempts;
    this.max_attempts = data.max_attempts;
    this.key = data.key;
    this.last_error = data.last_error;
    this.locked_at = data.locked_at;
    this.locked_by = data.locked_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class scheduled_jobs implements scheduled_jobs {
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
  constructor(data: scheduled_jobs) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.queue_name = data.queue_name;
    this.task_identifier = data.task_identifier;
    this.payload = data.payload;
    this.priority = data.priority;
    this.max_attempts = data.max_attempts;
    this.key = data.key;
    this.locked_at = data.locked_at;
    this.locked_by = data.locked_by;
    this.schedule_info = data.schedule_info;
    this.last_scheduled = data.last_scheduled;
    this.last_scheduled_id = data.last_scheduled_id;
  }
}