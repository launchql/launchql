export interface sql_features {
  feature_id: any | null;
  feature_name: any | null;
  sub_feature_id: any | null;
  sub_feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export class sql_features implements sql_features {
  feature_id: any | null;
  feature_name: any | null;
  sub_feature_id: any | null;
  sub_feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
  constructor(data: sql_features) {
    this.feature_id = data.feature_id;
    this.feature_name = data.feature_name;
    this.sub_feature_id = data.sub_feature_id;
    this.sub_feature_name = data.sub_feature_name;
    this.is_supported = data.is_supported;
    this.is_verified_by = data.is_verified_by;
    this.comments = data.comments;
  }
}
export interface sql_implementation_info {
  implementation_info_id: any | null;
  implementation_info_name: any | null;
  integer_value: any | null;
  character_value: any | null;
  comments: any | null;
}
export class sql_implementation_info implements sql_implementation_info {
  implementation_info_id: any | null;
  implementation_info_name: any | null;
  integer_value: any | null;
  character_value: any | null;
  comments: any | null;
  constructor(data: sql_implementation_info) {
    this.implementation_info_id = data.implementation_info_id;
    this.implementation_info_name = data.implementation_info_name;
    this.integer_value = data.integer_value;
    this.character_value = data.character_value;
    this.comments = data.comments;
  }
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
export class sql_languages implements sql_languages {
  sql_language_source: any | null;
  sql_language_year: any | null;
  sql_language_conformance: any | null;
  sql_language_integrity: any | null;
  sql_language_implementation: any | null;
  sql_language_binding_style: any | null;
  sql_language_programming_language: any | null;
  constructor(data: sql_languages) {
    this.sql_language_source = data.sql_language_source;
    this.sql_language_year = data.sql_language_year;
    this.sql_language_conformance = data.sql_language_conformance;
    this.sql_language_integrity = data.sql_language_integrity;
    this.sql_language_implementation = data.sql_language_implementation;
    this.sql_language_binding_style = data.sql_language_binding_style;
    this.sql_language_programming_language = data.sql_language_programming_language;
  }
}
export interface sql_packages {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export class sql_packages implements sql_packages {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
  constructor(data: sql_packages) {
    this.feature_id = data.feature_id;
    this.feature_name = data.feature_name;
    this.is_supported = data.is_supported;
    this.is_verified_by = data.is_verified_by;
    this.comments = data.comments;
  }
}
export interface sql_parts {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
}
export class sql_parts implements sql_parts {
  feature_id: any | null;
  feature_name: any | null;
  is_supported: any | null;
  is_verified_by: any | null;
  comments: any | null;
  constructor(data: sql_parts) {
    this.feature_id = data.feature_id;
    this.feature_name = data.feature_name;
    this.is_supported = data.is_supported;
    this.is_verified_by = data.is_verified_by;
    this.comments = data.comments;
  }
}
export interface sql_sizing {
  sizing_id: any | null;
  sizing_name: any | null;
  supported_value: any | null;
  comments: any | null;
}
export class sql_sizing implements sql_sizing {
  sizing_id: any | null;
  sizing_name: any | null;
  supported_value: any | null;
  comments: any | null;
  constructor(data: sql_sizing) {
    this.sizing_id = data.sizing_id;
    this.sizing_name = data.sizing_name;
    this.supported_value = data.supported_value;
    this.comments = data.comments;
  }
}
export interface sql_sizing_profiles {
  sizing_id: any | null;
  sizing_name: any | null;
  profile_id: any | null;
  required_value: any | null;
  comments: any | null;
}
export class sql_sizing_profiles implements sql_sizing_profiles {
  sizing_id: any | null;
  sizing_name: any | null;
  profile_id: any | null;
  required_value: any | null;
  comments: any | null;
  constructor(data: sql_sizing_profiles) {
    this.sizing_id = data.sizing_id;
    this.sizing_name = data.sizing_name;
    this.profile_id = data.profile_id;
    this.required_value = data.required_value;
    this.comments = data.comments;
  }
}