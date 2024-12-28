import { UUID } from "./_common";
export interface module_definitions {
  id: UUID;
  name: string;
  context: string;
  exec: any;
  defn: any;
  mls: string | null;
  mods: any | null;
  data: any | null;
}
export interface module_field {
  id: UUID;
  module_defn_id: UUID;
  name: string;
  description: string | null;
  is_required: boolean;
  default_value: string | null;
  is_array: boolean;
  default_module_id: UUID | null;
  default_module_value: string | null;
  type: any;
  field_order: number;
}
export interface module_input {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
}
export interface module_output {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
}
export interface modules {
  id: UUID;
  database_id: UUID;
  module_defn_id: UUID;
  context: string;
  active: boolean | null;
  data: any;
  executed: boolean | null;
  debug: any | null;
  mods: any | null;
}