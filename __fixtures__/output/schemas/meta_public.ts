import { UUID } from "./_common";
export interface api_extensions {
  id: UUID;
  schema_name: string | null;
  database_id: UUID;
  api_id: UUID;
}
export class api_extensions implements api_extensions {
  id: UUID;
  schema_name: string | null;
  database_id: UUID;
  api_id: UUID;
  constructor(data: api_extensions) {
    this.id = data.id;
    this.schema_name = data.schema_name;
    this.database_id = data.database_id;
    this.api_id = data.api_id;
  }
}
export interface api_modules {
  id: UUID;
  database_id: UUID;
  api_id: UUID;
  name: string;
  data: any;
}
export class api_modules implements api_modules {
  id: UUID;
  database_id: UUID;
  api_id: UUID;
  name: string;
  data: any;
  constructor(data: api_modules) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.api_id = data.api_id;
    this.name = data.name;
    this.data = data.data;
  }
}
export interface api_schemata {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  api_id: UUID;
}
export class api_schemata implements api_schemata {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  api_id: UUID;
  constructor(data: api_schemata) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.api_id = data.api_id;
  }
}
export interface apis {
  id: UUID;
  database_id: UUID;
  name: string;
  dbname: string;
  role_name: string;
  anon_role: string;
  is_public: boolean;
}
export class apis implements apis {
  id: UUID;
  database_id: UUID;
  name: string;
  dbname: string;
  role_name: string;
  anon_role: string;
  is_public: boolean;
  constructor(data: apis) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.name = data.name;
    this.dbname = data.dbname;
    this.role_name = data.role_name;
    this.anon_role = data.anon_role;
    this.is_public = data.is_public;
  }
}
export interface apps {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  name: string | null;
  app_image: any | null;
  app_store_link: any | null;
  app_store_id: string | null;
  app_id_prefix: string | null;
  play_store_link: any | null;
}
export class apps implements apps {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  name: string | null;
  app_image: any | null;
  app_store_link: any | null;
  app_store_id: string | null;
  app_id_prefix: string | null;
  play_store_link: any | null;
  constructor(data: apps) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.site_id = data.site_id;
    this.name = data.name;
    this.app_image = data.app_image;
    this.app_store_link = data.app_store_link;
    this.app_store_id = data.app_store_id;
    this.app_id_prefix = data.app_id_prefix;
    this.play_store_link = data.play_store_link;
  }
}
export interface connected_accounts_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
}
export class connected_accounts_module implements connected_accounts_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
  constructor(data: connected_accounts_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.owner_table_id = data.owner_table_id;
    this.table_name = data.table_name;
  }
}
export interface crypto_addresses_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
  crypto_network: string;
}
export class crypto_addresses_module implements crypto_addresses_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
  crypto_network: string;
  constructor(data: crypto_addresses_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.owner_table_id = data.owner_table_id;
    this.table_name = data.table_name;
    this.crypto_network = data.crypto_network;
  }
}
export interface crypto_auth_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  users_table_id: UUID;
  tokens_table_id: UUID;
  secrets_table_id: UUID;
  addresses_table_id: UUID;
  user_field: string;
  crypto_network: string;
  sign_in_request_challenge: string;
  sign_in_record_failure: string;
  sign_up_with_key: string;
  sign_in_with_challenge: string;
}
export class crypto_auth_module implements crypto_auth_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  users_table_id: UUID;
  tokens_table_id: UUID;
  secrets_table_id: UUID;
  addresses_table_id: UUID;
  user_field: string;
  crypto_network: string;
  sign_in_request_challenge: string;
  sign_in_record_failure: string;
  sign_up_with_key: string;
  sign_in_with_challenge: string;
  constructor(data: crypto_auth_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.users_table_id = data.users_table_id;
    this.tokens_table_id = data.tokens_table_id;
    this.secrets_table_id = data.secrets_table_id;
    this.addresses_table_id = data.addresses_table_id;
    this.user_field = data.user_field;
    this.crypto_network = data.crypto_network;
    this.sign_in_request_challenge = data.sign_in_request_challenge;
    this.sign_in_record_failure = data.sign_in_record_failure;
    this.sign_up_with_key = data.sign_up_with_key;
    this.sign_in_with_challenge = data.sign_in_with_challenge;
  }
}
export interface default_ids_module {
  id: UUID;
  database_id: UUID;
}
export class default_ids_module implements default_ids_module {
  id: UUID;
  database_id: UUID;
  constructor(data: default_ids_module) {
    this.id = data.id;
    this.database_id = data.database_id;
  }
}
export interface denormalized_table_field {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  field_id: UUID;
  set_ids: any | null;
  ref_table_id: UUID;
  ref_field_id: UUID;
  ref_ids: any | null;
  use_updates: boolean;
  update_defaults: boolean;
  func_name: string | null;
  func_order: number;
}
export class denormalized_table_field implements denormalized_table_field {
  id: UUID;
  database_id: UUID;
  table_id: UUID;
  field_id: UUID;
  set_ids: any | null;
  ref_table_id: UUID;
  ref_field_id: UUID;
  ref_ids: any | null;
  use_updates: boolean;
  update_defaults: boolean;
  func_name: string | null;
  func_order: number;
  constructor(data: denormalized_table_field) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.table_id = data.table_id;
    this.field_id = data.field_id;
    this.set_ids = data.set_ids;
    this.ref_table_id = data.ref_table_id;
    this.ref_field_id = data.ref_field_id;
    this.ref_ids = data.ref_ids;
    this.use_updates = data.use_updates;
    this.update_defaults = data.update_defaults;
    this.func_name = data.func_name;
    this.func_order = data.func_order;
  }
}
export interface domains {
  id: UUID;
  database_id: UUID;
  api_id: UUID | null;
  site_id: UUID | null;
  subdomain: any | null;
  domain: any | null;
}
export class domains implements domains {
  id: UUID;
  database_id: UUID;
  api_id: UUID | null;
  site_id: UUID | null;
  subdomain: any | null;
  domain: any | null;
  constructor(data: domains) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.api_id = data.api_id;
    this.site_id = data.site_id;
    this.subdomain = data.subdomain;
    this.domain = data.domain;
  }
}
export interface emails_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
}
export class emails_module implements emails_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
  constructor(data: emails_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.owner_table_id = data.owner_table_id;
    this.table_name = data.table_name;
  }
}
export interface encrypted_secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
}
export class encrypted_secrets_module implements encrypted_secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  constructor(data: encrypted_secrets_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
  }
}
export interface field_module {
  id: UUID;
  database_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  field_id: UUID;
  data: any;
  triggers: any | null;
  functions: any | null;
}
export class field_module implements field_module {
  id: UUID;
  database_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  field_id: UUID;
  data: any;
  triggers: any | null;
  functions: any | null;
  constructor(data: field_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.field_id = data.field_id;
    this.data = data.data;
    this.triggers = data.triggers;
    this.functions = data.functions;
  }
}
export interface invites_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  emails_table_id: UUID;
  users_table_id: UUID;
  invites_table_id: UUID;
  claimed_invites_table_id: UUID;
  invites_table_name: string;
  claimed_invites_table_name: string;
  submit_invite_code_function: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
}
export class invites_module implements invites_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  emails_table_id: UUID;
  users_table_id: UUID;
  invites_table_id: UUID;
  claimed_invites_table_id: UUID;
  invites_table_name: string;
  claimed_invites_table_name: string;
  submit_invite_code_function: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
  constructor(data: invites_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.emails_table_id = data.emails_table_id;
    this.users_table_id = data.users_table_id;
    this.invites_table_id = data.invites_table_id;
    this.claimed_invites_table_id = data.claimed_invites_table_id;
    this.invites_table_name = data.invites_table_name;
    this.claimed_invites_table_name = data.claimed_invites_table_name;
    this.submit_invite_code_function = data.submit_invite_code_function;
    this.prefix = data.prefix;
    this.membership_type = data.membership_type;
    this.entity_table_id = data.entity_table_id;
  }
}
export interface levels_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  steps_table_id: UUID;
  steps_table_name: string;
  achievements_table_id: UUID;
  achievements_table_name: string;
  levels_table_id: UUID;
  levels_table_name: string;
  level_requirements_table_id: UUID;
  level_requirements_table_name: string;
  completed_step: string;
  incompleted_step: string;
  tg_achievement: string;
  tg_achievement_toggle: string;
  tg_achievement_toggle_boolean: string;
  tg_achievement_boolean: string;
  upsert_achievement: string;
  tg_update_achievements: string;
  steps_required: string;
  level_achieved: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
}
export class levels_module implements levels_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  steps_table_id: UUID;
  steps_table_name: string;
  achievements_table_id: UUID;
  achievements_table_name: string;
  levels_table_id: UUID;
  levels_table_name: string;
  level_requirements_table_id: UUID;
  level_requirements_table_name: string;
  completed_step: string;
  incompleted_step: string;
  tg_achievement: string;
  tg_achievement_toggle: string;
  tg_achievement_toggle_boolean: string;
  tg_achievement_boolean: string;
  upsert_achievement: string;
  tg_update_achievements: string;
  steps_required: string;
  level_achieved: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
  constructor(data: levels_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.steps_table_id = data.steps_table_id;
    this.steps_table_name = data.steps_table_name;
    this.achievements_table_id = data.achievements_table_id;
    this.achievements_table_name = data.achievements_table_name;
    this.levels_table_id = data.levels_table_id;
    this.levels_table_name = data.levels_table_name;
    this.level_requirements_table_id = data.level_requirements_table_id;
    this.level_requirements_table_name = data.level_requirements_table_name;
    this.completed_step = data.completed_step;
    this.incompleted_step = data.incompleted_step;
    this.tg_achievement = data.tg_achievement;
    this.tg_achievement_toggle = data.tg_achievement_toggle;
    this.tg_achievement_toggle_boolean = data.tg_achievement_toggle_boolean;
    this.tg_achievement_boolean = data.tg_achievement_boolean;
    this.upsert_achievement = data.upsert_achievement;
    this.tg_update_achievements = data.tg_update_achievements;
    this.steps_required = data.steps_required;
    this.level_achieved = data.level_achieved;
    this.prefix = data.prefix;
    this.membership_type = data.membership_type;
    this.entity_table_id = data.entity_table_id;
    this.actor_table_id = data.actor_table_id;
  }
}
export interface limits_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  table_name: string;
  default_table_id: UUID;
  default_table_name: string;
  limit_increment_function: string;
  limit_decrement_function: string;
  limit_increment_trigger: string;
  limit_decrement_trigger: string;
  limit_update_trigger: string;
  limit_check_function: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
}
export class limits_module implements limits_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  table_name: string;
  default_table_id: UUID;
  default_table_name: string;
  limit_increment_function: string;
  limit_decrement_function: string;
  limit_increment_trigger: string;
  limit_decrement_trigger: string;
  limit_update_trigger: string;
  limit_check_function: string;
  prefix: string | null;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
  constructor(data: limits_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
    this.default_table_id = data.default_table_id;
    this.default_table_name = data.default_table_name;
    this.limit_increment_function = data.limit_increment_function;
    this.limit_decrement_function = data.limit_decrement_function;
    this.limit_increment_trigger = data.limit_increment_trigger;
    this.limit_decrement_trigger = data.limit_decrement_trigger;
    this.limit_update_trigger = data.limit_update_trigger;
    this.limit_check_function = data.limit_check_function;
    this.prefix = data.prefix;
    this.membership_type = data.membership_type;
    this.entity_table_id = data.entity_table_id;
    this.actor_table_id = data.actor_table_id;
  }
}
export interface membership_types_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
}
export class membership_types_module implements membership_types_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  constructor(data: membership_types_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
  }
}
export interface memberships_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  memberships_table_id: UUID;
  memberships_table_name: string;
  members_table_id: UUID;
  members_table_name: string;
  membership_defaults_table_id: UUID;
  membership_defaults_table_name: string;
  grants_table_id: UUID;
  grants_table_name: string;
  actor_table_id: UUID;
  limits_table_id: UUID;
  default_limits_table_id: UUID;
  permissions_table_id: UUID;
  default_permissions_table_id: UUID;
  acl_table_id: UUID;
  admin_grants_table_id: UUID;
  admin_grants_table_name: string;
  owner_grants_table_id: UUID;
  owner_grants_table_name: string;
  membership_type: number;
  entity_table_id: UUID | null;
  entity_table_owner_id: UUID | null;
  prefix: string | null;
  actor_mask_check: string;
  actor_perm_check: string;
  entity_ids_by_mask: string | null;
  entity_ids_by_perm: string | null;
  entity_ids_function: string | null;
}
export class memberships_module implements memberships_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  memberships_table_id: UUID;
  memberships_table_name: string;
  members_table_id: UUID;
  members_table_name: string;
  membership_defaults_table_id: UUID;
  membership_defaults_table_name: string;
  grants_table_id: UUID;
  grants_table_name: string;
  actor_table_id: UUID;
  limits_table_id: UUID;
  default_limits_table_id: UUID;
  permissions_table_id: UUID;
  default_permissions_table_id: UUID;
  acl_table_id: UUID;
  admin_grants_table_id: UUID;
  admin_grants_table_name: string;
  owner_grants_table_id: UUID;
  owner_grants_table_name: string;
  membership_type: number;
  entity_table_id: UUID | null;
  entity_table_owner_id: UUID | null;
  prefix: string | null;
  actor_mask_check: string;
  actor_perm_check: string;
  entity_ids_by_mask: string | null;
  entity_ids_by_perm: string | null;
  entity_ids_function: string | null;
  constructor(data: memberships_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.memberships_table_id = data.memberships_table_id;
    this.memberships_table_name = data.memberships_table_name;
    this.members_table_id = data.members_table_id;
    this.members_table_name = data.members_table_name;
    this.membership_defaults_table_id = data.membership_defaults_table_id;
    this.membership_defaults_table_name = data.membership_defaults_table_name;
    this.grants_table_id = data.grants_table_id;
    this.grants_table_name = data.grants_table_name;
    this.actor_table_id = data.actor_table_id;
    this.limits_table_id = data.limits_table_id;
    this.default_limits_table_id = data.default_limits_table_id;
    this.permissions_table_id = data.permissions_table_id;
    this.default_permissions_table_id = data.default_permissions_table_id;
    this.acl_table_id = data.acl_table_id;
    this.admin_grants_table_id = data.admin_grants_table_id;
    this.admin_grants_table_name = data.admin_grants_table_name;
    this.owner_grants_table_id = data.owner_grants_table_id;
    this.owner_grants_table_name = data.owner_grants_table_name;
    this.membership_type = data.membership_type;
    this.entity_table_id = data.entity_table_id;
    this.entity_table_owner_id = data.entity_table_owner_id;
    this.prefix = data.prefix;
    this.actor_mask_check = data.actor_mask_check;
    this.actor_perm_check = data.actor_perm_check;
    this.entity_ids_by_mask = data.entity_ids_by_mask;
    this.entity_ids_by_perm = data.entity_ids_by_perm;
    this.entity_ids_function = data.entity_ids_function;
  }
}
export interface permissions_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  table_name: string;
  default_table_id: UUID;
  default_table_name: string;
  bitlen: number;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
  prefix: string | null;
  get_padded_mask: string;
  get_mask: string;
  get_by_mask: string;
  get_mask_by_name: string;
}
export class permissions_module implements permissions_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  table_name: string;
  default_table_id: UUID;
  default_table_name: string;
  bitlen: number;
  membership_type: number;
  entity_table_id: UUID | null;
  actor_table_id: UUID;
  prefix: string | null;
  get_padded_mask: string;
  get_mask: string;
  get_by_mask: string;
  get_mask_by_name: string;
  constructor(data: permissions_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
    this.default_table_id = data.default_table_id;
    this.default_table_name = data.default_table_name;
    this.bitlen = data.bitlen;
    this.membership_type = data.membership_type;
    this.entity_table_id = data.entity_table_id;
    this.actor_table_id = data.actor_table_id;
    this.prefix = data.prefix;
    this.get_padded_mask = data.get_padded_mask;
    this.get_mask = data.get_mask;
    this.get_by_mask = data.get_by_mask;
    this.get_mask_by_name = data.get_mask_by_name;
  }
}
export interface phone_numbers_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
}
export class phone_numbers_module implements phone_numbers_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
  constructor(data: phone_numbers_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.table_id = data.table_id;
    this.owner_table_id = data.owner_table_id;
    this.table_name = data.table_name;
  }
}
export interface rls_module {
  id: UUID;
  database_id: UUID;
  api_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  tokens_table_id: UUID;
  users_table_id: UUID;
  authenticate: string;
  authenticate_strict: string;
  current_role: string;
  current_role_id: string;
}
export class rls_module implements rls_module {
  id: UUID;
  database_id: UUID;
  api_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  tokens_table_id: UUID;
  users_table_id: UUID;
  authenticate: string;
  authenticate_strict: string;
  current_role: string;
  current_role_id: string;
  constructor(data: rls_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.api_id = data.api_id;
    this.schema_id = data.schema_id;
    this.private_schema_id = data.private_schema_id;
    this.tokens_table_id = data.tokens_table_id;
    this.users_table_id = data.users_table_id;
    this.authenticate = data.authenticate;
    this.authenticate_strict = data.authenticate_strict;
    this.current_role = data.current_role;
    this.current_role_id = data.current_role_id;
  }
}
export interface secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
}
export class secrets_module implements secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  constructor(data: secrets_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
  }
}
export interface site_metadata {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  title: string | null;
  description: string | null;
  og_image: any | null;
}
export class site_metadata implements site_metadata {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  title: string | null;
  description: string | null;
  og_image: any | null;
  constructor(data: site_metadata) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.site_id = data.site_id;
    this.title = data.title;
    this.description = data.description;
    this.og_image = data.og_image;
  }
}
export interface site_modules {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  name: string;
  data: any;
}
export class site_modules implements site_modules {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  name: string;
  data: any;
  constructor(data: site_modules) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.site_id = data.site_id;
    this.name = data.name;
    this.data = data.data;
  }
}
export interface site_themes {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  theme: any;
}
export class site_themes implements site_themes {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  theme: any;
  constructor(data: site_themes) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.site_id = data.site_id;
    this.theme = data.theme;
  }
}
export interface sites {
  id: UUID;
  database_id: UUID;
  title: string | null;
  description: string | null;
  og_image: any | null;
  favicon: any | null;
  apple_touch_icon: any | null;
  logo: any | null;
  dbname: string;
}
export class sites implements sites {
  id: UUID;
  database_id: UUID;
  title: string | null;
  description: string | null;
  og_image: any | null;
  favicon: any | null;
  apple_touch_icon: any | null;
  logo: any | null;
  dbname: string;
  constructor(data: sites) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.title = data.title;
    this.description = data.description;
    this.og_image = data.og_image;
    this.favicon = data.favicon;
    this.apple_touch_icon = data.apple_touch_icon;
    this.logo = data.logo;
    this.dbname = data.dbname;
  }
}
export interface tokens_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  owned_table_id: UUID;
  tokens_default_expiration: any;
  tokens_table: string;
}
export class tokens_module implements tokens_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  owned_table_id: UUID;
  tokens_default_expiration: any;
  tokens_table: string;
  constructor(data: tokens_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.table_id = data.table_id;
    this.owned_table_id = data.owned_table_id;
    this.tokens_default_expiration = data.tokens_default_expiration;
    this.tokens_table = data.tokens_table;
  }
}
export interface user_auth_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  emails_table_id: UUID;
  users_table_id: UUID;
  secrets_table_id: UUID;
  encrypted_table_id: UUID;
  tokens_table_id: UUID;
  audits_table_id: UUID;
  audits_table_name: string;
  sign_in_function: string;
  sign_up_function: string;
  sign_out_function: string;
  set_password_function: string;
  reset_password_function: string;
  forgot_password_function: string;
  send_verification_email_function: string;
  verify_email_function: string;
  verify_password_function: string;
  check_password_function: string;
  send_account_deletion_email_function: string;
  delete_account_function: string;
  sign_in_one_time_token_function: string;
  one_time_token_function: string;
  extend_token_expires: string;
}
export class user_auth_module implements user_auth_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  emails_table_id: UUID;
  users_table_id: UUID;
  secrets_table_id: UUID;
  encrypted_table_id: UUID;
  tokens_table_id: UUID;
  audits_table_id: UUID;
  audits_table_name: string;
  sign_in_function: string;
  sign_up_function: string;
  sign_out_function: string;
  set_password_function: string;
  reset_password_function: string;
  forgot_password_function: string;
  send_verification_email_function: string;
  verify_email_function: string;
  verify_password_function: string;
  check_password_function: string;
  send_account_deletion_email_function: string;
  delete_account_function: string;
  sign_in_one_time_token_function: string;
  one_time_token_function: string;
  extend_token_expires: string;
  constructor(data: user_auth_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.emails_table_id = data.emails_table_id;
    this.users_table_id = data.users_table_id;
    this.secrets_table_id = data.secrets_table_id;
    this.encrypted_table_id = data.encrypted_table_id;
    this.tokens_table_id = data.tokens_table_id;
    this.audits_table_id = data.audits_table_id;
    this.audits_table_name = data.audits_table_name;
    this.sign_in_function = data.sign_in_function;
    this.sign_up_function = data.sign_up_function;
    this.sign_out_function = data.sign_out_function;
    this.set_password_function = data.set_password_function;
    this.reset_password_function = data.reset_password_function;
    this.forgot_password_function = data.forgot_password_function;
    this.send_verification_email_function = data.send_verification_email_function;
    this.verify_email_function = data.verify_email_function;
    this.verify_password_function = data.verify_password_function;
    this.check_password_function = data.check_password_function;
    this.send_account_deletion_email_function = data.send_account_deletion_email_function;
    this.delete_account_function = data.delete_account_function;
    this.sign_in_one_time_token_function = data.sign_in_one_time_token_function;
    this.one_time_token_function = data.one_time_token_function;
    this.extend_token_expires = data.extend_token_expires;
  }
}
export interface users_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  type_table_id: UUID;
  type_table_name: string;
}
export class users_module implements users_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  type_table_id: UUID;
  type_table_name: string;
  constructor(data: users_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.table_id = data.table_id;
    this.table_name = data.table_name;
    this.type_table_id = data.type_table_id;
    this.type_table_name = data.type_table_name;
  }
}
export interface uuid_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  uuid_function: string;
  uuid_seed: string;
}
export class uuid_module implements uuid_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  uuid_function: string;
  uuid_seed: string;
  constructor(data: uuid_module) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.schema_id = data.schema_id;
    this.uuid_function = data.uuid_function;
    this.uuid_seed = data.uuid_seed;
  }
}