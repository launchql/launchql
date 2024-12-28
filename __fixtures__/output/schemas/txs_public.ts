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
export class commit implements commit {
  id: UUID;
  message: string | null;
  database_id: UUID;
  parent_ids: any | null;
  author_id: UUID | null;
  committer_id: UUID | null;
  tree_id: UUID | null;
  date: Timestamp;
  constructor(data: commit) {
    this.id = data.id;
    this.message = data.message;
    this.database_id = data.database_id;
    this.parent_ids = data.parent_ids;
    this.author_id = data.author_id;
    this.committer_id = data.committer_id;
    this.tree_id = data.tree_id;
    this.date = data.date;
  }
}
export interface ref {
  id: UUID;
  name: string;
  database_id: UUID;
  commit_id: UUID | null;
}
export class ref implements ref {
  id: UUID;
  name: string;
  database_id: UUID;
  commit_id: UUID | null;
  constructor(data: ref) {
    this.id = data.id;
    this.name = data.name;
    this.database_id = data.database_id;
    this.commit_id = data.commit_id;
  }
}