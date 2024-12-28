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
export class changes implements changes {
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
  constructor(data: changes) {
    this.change_id = data.change_id;
    this.script_hash = data.script_hash;
    this.change = data.change;
    this.project = data.project;
    this.note = data.note;
    this.committed_at = data.committed_at;
    this.committer_name = data.committer_name;
    this.committer_email = data.committer_email;
    this.planned_at = data.planned_at;
    this.planner_name = data.planner_name;
    this.planner_email = data.planner_email;
  }
}
export interface dependencies {
  change_id: string;
  type: string;
  dependency: string;
  dependency_id: string | null;
}
export class dependencies implements dependencies {
  change_id: string;
  type: string;
  dependency: string;
  dependency_id: string | null;
  constructor(data: dependencies) {
    this.change_id = data.change_id;
    this.type = data.type;
    this.dependency = data.dependency;
    this.dependency_id = data.dependency_id;
  }
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
export class events implements events {
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
  constructor(data: events) {
    this.event = data.event;
    this.change_id = data.change_id;
    this.change = data.change;
    this.project = data.project;
    this.note = data.note;
    this.requires = data.requires;
    this.conflicts = data.conflicts;
    this.tags = data.tags;
    this.committed_at = data.committed_at;
    this.committer_name = data.committer_name;
    this.committer_email = data.committer_email;
    this.planned_at = data.planned_at;
    this.planner_name = data.planner_name;
    this.planner_email = data.planner_email;
  }
}
export interface projects {
  project: string;
  uri: string | null;
  created_at: Timestamp;
  creator_name: string;
  creator_email: string;
}
export class projects implements projects {
  project: string;
  uri: string | null;
  created_at: Timestamp;
  creator_name: string;
  creator_email: string;
  constructor(data: projects) {
    this.project = data.project;
    this.uri = data.uri;
    this.created_at = data.created_at;
    this.creator_name = data.creator_name;
    this.creator_email = data.creator_email;
  }
}
export interface releases {
  version: any;
  installed_at: Timestamp;
  installer_name: string;
  installer_email: string;
}
export class releases implements releases {
  version: any;
  installed_at: Timestamp;
  installer_name: string;
  installer_email: string;
  constructor(data: releases) {
    this.version = data.version;
    this.installed_at = data.installed_at;
    this.installer_name = data.installer_name;
    this.installer_email = data.installer_email;
  }
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
export class tags implements tags {
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
  constructor(data: tags) {
    this.tag_id = data.tag_id;
    this.tag = data.tag;
    this.project = data.project;
    this.change_id = data.change_id;
    this.note = data.note;
    this.committed_at = data.committed_at;
    this.committer_name = data.committer_name;
    this.committer_email = data.committer_email;
    this.planned_at = data.planned_at;
    this.planner_name = data.planner_name;
    this.planner_email = data.planner_email;
  }
}