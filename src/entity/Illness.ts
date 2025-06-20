export class Illness {
  id: number;
  catId: number;
  illnessName: string;
  treatmentMethod: string;
  isCured: boolean;
  created_at: string;
  updated_at: string;

  constructor() {
    this.id = 0;
    this.catId = 0;
    this.illnessName = "";
    this.treatmentMethod = "";
    this.isCured = false;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }
}
