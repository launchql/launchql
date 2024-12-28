import { UUID } from "./_common";
export interface api_extensions {
  id: UUID;
  schema_name: string | null;
  database_id: UUID;
  api_id: UUID;
}
export interface api_modules {
  id: UUID;
  database_id: UUID;
  api_id: UUID;
  name: string;
  data: any;
}
export interface api_schemata {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  api_id: UUID;
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
export interface connected_accounts_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
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
export interface default_ids_module {
  id: UUID;
  database_id: UUID;
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
export interface domains {
  id: UUID;
  database_id: UUID;
  api_id: UUID | null;
  site_id: UUID | null;
  subdomain: any | null;
  domain: any | null;
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
export interface encrypted_secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
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
export interface membership_types_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
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
export interface phone_numbers_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  private_schema_id: UUID;
  table_id: UUID;
  owner_table_id: UUID;
  table_name: string;
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
export interface secrets_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
}
export interface site_metadata {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  title: string | null;
  description: string | null;
  og_image: any | null;
}
export interface site_modules {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  name: string;
  data: any;
}
export interface site_themes {
  id: UUID;
  database_id: UUID;
  site_id: UUID;
  theme: any;
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
export interface tokens_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  owned_table_id: UUID;
  tokens_default_expiration: any;
  tokens_table: string;
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
export interface users_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  table_id: UUID;
  table_name: string;
  type_table_id: UUID;
  type_table_name: string;
}
export interface uuid_module {
  id: UUID;
  database_id: UUID;
  schema_id: UUID;
  uuid_function: string;
  uuid_seed: string;
}