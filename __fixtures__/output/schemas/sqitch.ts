import { Timestamp } from "./_common";
export interface changes {
  change_id: string;
  script_hash: string | null;
  change: string;
  project: string;
  note: string;
  committed_at: Timestamp;
  committer_name: string;
  committer_email: string;
  planned_at: Timestamp;
  planner_name: string;
  planner_email: string;
}
export interface dependencies {
  change_id: string;
  type: string;
  dependency: string;
  dependency_id: string | null;
}
export interface events {
  event: string;
  change_id: string;
  change: string;
  project: string;
  note: string;
  requires: any;
  conflicts: any;
  tags: any;
  committed_at: Timestamp;
  committer_name: string;
  committer_email: string;
  planned_at: Timestamp;
  planner_name: string;
  planner_email: string;
}
export interface projects {
  project: string;
  uri: string | null;
  created_at: Timestamp;
  creator_name: string;
  creator_email: string;
}
export interface releases {
  version: any;
  installed_at: Timestamp;
  installer_name: string;
  installer_email: string;
}
export interface tags {
  tag_id: string;
  tag: string;
  project: string;
  change_id: string;
  note: string;
  committed_at: Timestamp;
  committer_name: string;
  committer_email: string;
  planned_at: Timestamp;
  planner_name: string;
  planner_email: string;
}