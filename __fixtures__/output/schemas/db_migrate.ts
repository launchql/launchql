import { UUID, Timestamp } from "./_common";
export interface migrate_files {
  id: UUID;
  database_id: UUID | null;
  upload: any | null;
}
export class migrate_files implements migrate_files {
  id: UUID;
  database_id: UUID | null;
  upload: any | null;
  constructor(data: migrate_files) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.upload = data.upload;
  }
}
export interface sql_actions {
  id: number;
  name: string | null;
  database_id: UUID | null;
  deploy: string | null;
  deps: any | null;
  payload: any | null;
  content: string | null;
  revert: string | null;
  verify: string | null;
  created_at: Timestamp | null;
}
export class sql_actions implements sql_actions {
  id: number;
  name: string | null;
  database_id: UUID | null;
  deploy: string | null;
  deps: any | null;
  payload: any | null;
  content: string | null;
  revert: string | null;
  verify: string | null;
  created_at: Timestamp | null;
  constructor(data: sql_actions) {
    this.id = data.id;
    this.name = data.name;
    this.database_id = data.database_id;
    this.deploy = data.deploy;
    this.deps = data.deps;
    this.payload = data.payload;
    this.content = data.content;
    this.revert = data.revert;
    this.verify = data.verify;
    this.created_at = data.created_at;
  }
}