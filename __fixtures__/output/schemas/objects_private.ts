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