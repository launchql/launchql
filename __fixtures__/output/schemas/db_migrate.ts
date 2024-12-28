import { UUID, Timestamp } from "./_common";
export interface migrate_files {
  id: UUID;
  database_id: UUID | null;
  upload: any | null;
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