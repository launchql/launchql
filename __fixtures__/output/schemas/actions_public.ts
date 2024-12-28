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
export class ast_actions implements ast_actions {
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
  constructor(data: ast_actions) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.requires = data.requires;
    this.payload = data.payload;
    this.deploys = data.deploys;
    this.deploy = data.deploy;
    this.revert = data.revert;
    this.verify = data.verify;
    this.created_at = data.created_at;
  }
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
export class ast_trees implements ast_trees {
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
  constructor(data: ast_trees) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.mods = data.mods;
    this.deps = data.deps;
    this.depl = data.depl;
    this.args = data.args;
    this.deploy = data.deploy;
    this.revert = data.revert;
    this.verify = data.verify;
  }
}