import { UUID, Timestamp } from "./_common";
export interface object {
  id: UUID;
  database_id: UUID;
  kids: any | null;
  ktree: any | null;
  data: any | null;
  frzn: boolean | null;
  created_at: Timestamp | null;
}
export class object implements object {
  id: UUID;
  database_id: UUID;
  kids: any | null;
  ktree: any | null;
  data: any | null;
  frzn: boolean | null;
  created_at: Timestamp | null;
  constructor(data: object) {
    this.id = data.id;
    this.database_id = data.database_id;
    this.kids = data.kids;
    this.ktree = data.ktree;
    this.data = data.data;
    this.frzn = data.frzn;
    this.created_at = data.created_at;
  }
}