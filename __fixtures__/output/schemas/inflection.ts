import { UUID } from "./_common";
export interface inflection_rules {
  id: UUID;
  type: string | null;
  test: string | null;
  replacement: string | null;
}
export class inflection_rules implements inflection_rules {
  id: UUID;
  type: string | null;
  test: string | null;
  replacement: string | null;
  constructor(data: inflection_rules) {
    this.id = data.id;
    this.type = data.type;
    this.test = data.test;
    this.replacement = data.replacement;
  }
}