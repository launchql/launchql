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
export class check_constraint implements check_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  type: string | null;
  field_ids: any;
  expr: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: check_constraint) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.type = data.type;
    this.field_ids = data.field_ids;
    this.expr = data.expr;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class database implements database {
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
  constructor(data: database) {
    this.id = data.id;
    this.owner_id = data.owner_id;
    this.schema_hash = data.schema_hash;
    this.schema_name = data.schema_name;
    this.private_schema_name = data.private_schema_name;
    this.name = data.name;
    this.label = data.label;
    this.hash = data.hash;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
export interface database_extension {
  name: string;
  database_id: UUID;
}
export class database_extension implements database_extension {
  name: string;
  database_id: UUID;
  constructor(data: database_extension) {
    this.name = data.name;
    this.database_id = data.database_id;
  }
}
export interface extension {
  name: string;
  public_schemas: any | null;
  private_schemas: any | null;
}
export class extension implements extension {
  name: string;
  public_schemas: any | null;
  private_schemas: any | null;
  constructor(data: extension) {
    this.name = data.name;
    this.public_schemas = data.public_schemas;
    this.private_schemas = data.private_schemas;
  }
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
export class field implements field {
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
  constructor(data: field) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.label = data.label;
    this.description = data.description;
    this.smart_tags = data.smart_tags;
    this.is_required = data.is_required;
    this.default_value = data.default_value;
    this.is_hidden = data.is_hidden;
    this.type = data.type;
    this.field_order = data.field_order;
    this.regexp = data.regexp;
    this.chk = data.chk;
    this.chk_expr = data.chk_expr;
    this.min = data.min;
    this.max = data.max;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class foreign_key_constraint implements foreign_key_constraint {
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
  constructor(data: foreign_key_constraint) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.description = data.description;
    this.smart_tags = data.smart_tags;
    this.type = data.type;
    this.field_ids = data.field_ids;
    this.ref_table_id = data.ref_table_id;
    this.ref_field_ids = data.ref_field_ids;
    this.delete_action = data.delete_action;
    this.update_action = data.update_action;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class full_text_search implements full_text_search {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  field_id: UUID;
  field_ids: any;
  weights: any;
  langs: any;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: full_text_search) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.field_id = data.field_id;
    this.field_ids = data.field_ids;
    this.weights = data.weights;
    this.langs = data.langs;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class index implements index {
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
  constructor(data: index) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.field_ids = data.field_ids;
    this.include_field_ids = data.include_field_ids;
    this.access_method = data.access_method;
    this.index_params = data.index_params;
    this.where_clause = data.where_clause;
    this.is_unique = data.is_unique;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class limit_function implements limit_function {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  label: string | null;
  description: string | null;
  data: any | null;
  security: number | null;
  constructor(data: limit_function) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.label = data.label;
    this.description = data.description;
    this.data = data.data;
    this.security = data.security;
  }
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
export class policy implements policy {
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
  constructor(data: policy) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.role_name = data.role_name;
    this.privilege = data.privilege;
    this.permissive = data.permissive;
    this.disabled = data.disabled;
    this.template = data.template;
    this.data = data.data;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class primary_key_constraint implements primary_key_constraint {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string | null;
  type: string | null;
  field_ids: any;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: primary_key_constraint) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.type = data.type;
    this.field_ids = data.field_ids;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class procedure implements procedure {
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
  constructor(data: procedure) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.argnames = data.argnames;
    this.argtypes = data.argtypes;
    this.argdefaults = data.argdefaults;
    this.lang_name = data.lang_name;
    this.definition = data.definition;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class rls_function implements rls_function {
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
  constructor(data: rls_function) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.label = data.label;
    this.description = data.description;
    this.data = data.data;
    this.inline = data.inline;
    this.security = data.security;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class schema implements schema {
  id: UUID;
  database_id: UUID;
  name: string;
  schema_name: string;
  label: string | null;
  description: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: schema) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.schema_name = data.schema_name;
    this.label = data.label;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
export interface schema_grant {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  grantee_name: string;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export class schema_grant implements schema_grant {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  grantee_name: string;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: schema_grant) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.grantee_name = data.grantee_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class table implements table {
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
  constructor(data: table) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.name = data.name;
    this.label = data.label;
    this.description = data.description;
    this.smart_tags = data.smart_tags;
    this.is_system = data.is_system;
    this.use_rls = data.use_rls;
    this.timestamps = data.timestamps;
    this.peoplestamps = data.peoplestamps;
    this.plural_name = data.plural_name;
    this.singular_name = data.singular_name;
    this.inherits_id = data.inherits_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class table_grant implements table_grant {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  privilege: string;
  role_name: string;
  field_ids: any | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: table_grant) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.privilege = data.privilege;
    this.role_name = data.role_name;
    this.field_ids = data.field_ids;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class trigger implements trigger {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  name: string;
  event: string | null;
  function_name: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: trigger) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.event = data.event;
    this.function_name = data.function_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
export interface trigger_function {
  id: UUID;
  database_id: UUID;
  name: string;
  code: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}
export class trigger_function implements trigger_function {
  id: UUID;
  database_id: UUID;
  name: string;
  code: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  constructor(data: trigger_function) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.code = data.code;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
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
export class unique_constraint implements unique_constraint {
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
  constructor(data: unique_constraint) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.name = data.name;
    this.description = data.description;
    this.smart_tags = data.smart_tags;
    this.type = data.type;
    this.field_ids = data.field_ids;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}