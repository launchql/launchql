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