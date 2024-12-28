import { UUID, Timestamp } from "./_common";
export interface commit {
  id: UUID;
  message: string | null;
  database_id: UUID;
  parent_ids: any | null;
  author_id: UUID | null;
  committer_id: UUID | null;
  tree_id: UUID | null;
  date: Timestamp;
}
export interface ref {
  id: UUID;
  name: string;
  database_id: UUID;
  commit_id: UUID | null;
}