export class MonthlyStats {
  id: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  kittenCount: number;

  constructor() {
    this.id = 0;
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.kittenCount = 0;
  }
}
