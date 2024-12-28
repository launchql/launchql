import { UUID, Timestamp } from "./_common";
export interface check_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  type: string | null;
  field_ids: any;
  expr: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface database {
  id: UUID;
  owner_id: UUID | null;
  schema_hash: string | null;
  schema_name: string | null;
  private_schema_name: string | null;
  name: string | null;
  label: string | null;
  hash: UUID | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface database_extension {
  name: string;
  database_id: UUID;
}
export interface extension {
  name: string;
  public_schemas: any | null;
  private_schemas: any | null;
}
export interface field {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string;
  label: string | null;
  description: string | null;
  smart_tags: any | null;
  is_required: boolean;
  default_value: string | null;
  is_hidden: boolean;
  type: any;
  field_order: number;
  regexp: string | null;
  chk: any | null;
  chk_expr: any | null;
  min: any | null;
  max: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface foreign_key_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  description: string | null;
  smart_tags: any | null;
  type: string | null;
  field_ids: any;
  ref_table_id: UUID;
  ref_field_ids: any;
  delete_action: any | null;
  update_action: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface full_text_search {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  field_id: UUID;
  field_ids: any;
  weights: any;
  langs: any;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface index {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string;
  field_ids: any | null;
  include_field_ids: any | null;
  access_method: string;
  index_params: any | null;
  where_clause: any | null;
  is_unique: boolean;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface limit_function {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  label: string | null;
  description: string | null;
  data: any | null;
  security: number | null;
}
export interface policy {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  role_name: string | null;
  privilege: string | null;
  permissive: boolean | null;
  disabled: boolean | null;
  template: string | null;
  data: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface primary_key_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  type: string | null;
  field_ids: any;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface procedure {
  id: UUID;
  database_id: UUID;
  name: string;
  argnames: any | null;
  argtypes: any | null;
  argdefaults: any | null;
  lang_name: string | null;
  definition: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface rls_function {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  label: string | null;
  description: string | null;
  data: any | null;
  inline: boolean | null;
  security: number | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface schema {
  id: UUID;
  database_id: UUID;
  name: string;
  schema_name: string;
  label: string | null;
  description: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface schema_grant {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  grantee_name: string;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface table {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  name: string;
  label: string | null;
  description: string | null;
  smart_tags: any | null;
  is_system: boolean | null;
  use_rls: boolean;
  timestamps: boolean;
  peoplestamps: boolean;
  plural_name: string | null;
  singular_name: string | null;
  inherits_id: UUID | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface table_grant {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  privilege: string;
  role_name: string;
  field_ids: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface trigger {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string;
  event: string | null;
  function_name: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface trigger_function {
  id: UUID;
  database_id: UUID;
  name: string;
  code: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export interface unique_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  description: string | null;
  smart_tags: any | null;
  type: string | null;
  field_ids: any;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}