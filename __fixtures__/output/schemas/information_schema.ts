export interface sql_features {
  feature_id: any | null;
  feature_name: any | null;
  sub_feature_id: any | null;
  sub_feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export interface sql_implementation_info {
  implementation_info_id: any | null;
  implementation_info_name: any | null;
  integer_value: any | null;
  character_value: any | null;
  comments: any | null;
}
export interface sql_languages {
  sql_language_source: any | null;
  sql_language_year: any | null;
  sql_language_conformance: any | null;
  sql_language_integrity: any | null;
  sql_language_implementation: any | null;
  sql_language_binding_style: any | null;
  sql_language_programming_language: any | null;
}
export interface sql_packages {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export interface sql_parts {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export interface sql_sizing {
  sizing_id: any | null;
  sizing_name: any | null;
  supported_value: any | null;
  comments: any | null;
}
export interface sql_sizing_profiles {
  sizing_id: any | null;
  sizing_name: any | null;
  profile_id: any | null;
  required_value: any | null;
  comments: any | null;
}