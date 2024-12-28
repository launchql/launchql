import { UUID } from "./_common";
export interface definition {
  id: UUID;
  name: any;
  mods: any | null;
  deps: any | null;
  depl: any | null;
  args: any | null;
  deploy: string | null;
  revert: string | null;
  verify: string | null;
}
export class definition implements definition {
  id: UUID;
  name: any;
  mods: any | null;
  deps: any | null;
  depl: any | null;
  args: any | null;
  deploy: string | null;
  revert: string | null;
  verify: string | null;
  constructor(data: definition) {
    this.id = data.id;
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
export interface definition_field {
  id: UUID;
  defn_id: UUID;
  name: any;
  description: string | null;
  is_required: boolean;
  default_value: string | null;
  default_module_id: UUID | null;
  default_module_value: string | null;
  type: any;
  field_order: number;
}
export class definition_field implements definition_field {
  id: UUID;
  defn_id: UUID;
  name: any;
  description: string | null;
  is_required: boolean;
  default_value: string | null;
  default_module_id: UUID | null;
  default_module_value: string | null;
  type: any;
  field_order: number;
  constructor(data: definition_field) {
    this.id = data.id;
    this.defn_id = data.defn_id;
    this.name = data.name;
    this.description = data.description;
    this.is_required = data.is_required;
    this.default_value = data.default_value;
    this.default_module_id = data.default_module_id;
    this.default_module_value = data.default_module_value;
    this.type = data.type;
    this.field_order = data.field_order;
  }
}