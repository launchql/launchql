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
export class module_definitions implements module_definitions {
  id: UUID;
  name: string;
  context: string;
  exec: any;
  defn: any;
  mls: string | null;
  mods: any | null;
  data: any | null;
  constructor(data: module_definitions) {
    this.id = data.id;
    this.name = data.name;
    this.context = data.context;
    this.exec = data.exec;
    this.defn = data.defn;
    this.mls = data.mls;
    this.mods = data.mods;
    this.data = data.data;
  }
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
export class module_field implements module_field {
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
  constructor(data: module_field) {
    this.id = data.id;
    this.module_defn_id = data.module_defn_id;
    this.name = data.name;
    this.description = data.description;
    this.is_required = data.is_required;
    this.default_value = data.default_value;
    this.is_array = data.is_array;
    this.default_module_id = data.default_module_id;
    this.default_module_value = data.default_module_value;
    this.type = data.type;
    this.field_order = data.field_order;
  }
}
export interface module_input {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
}
export class module_input implements module_input {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
  constructor(data: module_input) {
    this.id = data.id;
    this.module_id = data.module_id;
    this.name = data.name;
    this.value = data.value;
  }
}
export interface module_output {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
}
export class module_output implements module_output {
  id: UUID;
  module_id: UUID;
  name: string;
  value: string;
  constructor(data: module_output) {
    this.id = data.id;
    this.module_id = data.module_id;
    this.name = data.name;
    this.value = data.value;
  }
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
export class modules implements modules {
  id: UUID;
  database_id: UUID;
  module_defn_id: UUID;
  context: string;
  active: boolean | null;
  data: any;
  executed: boolean | null;
  debug: any | null;
  mods: any | null;
  constructor(data: modules) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.module_defn_id = data.module_defn_id;
    this.context = data.context;
    this.active = data.active;
    this.data = data.data;
    this.executed = data.executed;
    this.debug = data.debug;
    this.mods = data.mods;
  }
}