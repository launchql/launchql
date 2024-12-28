import { UUID, Timestamp } from "./_common";
export interface ast_actions {
  id: number;
  database_id: UUID;
  name: any | null;
  requires: any | null;
  payload: any | null;
  deploys: any | null;
  deploy: any | null;
  revert: any | null;
  verify: any | null;
  created_at: Timestamp | null;
}
export interface ast_trees {
  id: UUID;
  database_id: UUID;
  name: any | null;
  mods: any | null;
  deps: any | null;
  depl: any | null;
  args: any | null;
  deploy: any | null;
  revert: any | null;
  verify: any | null;
}