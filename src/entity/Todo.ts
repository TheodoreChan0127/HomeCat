export class Todo {
  id: number;
  catId: number;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;

  constructor() {
    this.catId = 0;
    this.content = "";
    this.status = "pending";
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }
}
