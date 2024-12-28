import { UUID } from "./_common";
export interface words {
  id: UUID;
  type: string | null;
  word: string | null;
}
export class words implements words {
  id: UUID;
  type: string | null;
  word: string | null;
  constructor(data: words) {
    this.id = data.id;
    this.type = data.type;
    this.word = data.word;
  }
}