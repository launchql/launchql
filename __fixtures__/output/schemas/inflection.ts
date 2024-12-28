import { UUID } from "./_common";
export interface inflection_rules {
  id: UUID;
  type: string | null;
  test: string | null;
  replacement: string | null;
}