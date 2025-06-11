export class Purchase {
  id: number;
  item: string;
  amount: number;
  isSingleCat: boolean;
  catId?: number; // 可选，单猫支出时填写
  purchaseDate: string;

  constructor() {
    this.id = 0;
    this.item = "";
    this.amount = 0;
    this.isSingleCat = false;
    this.purchaseDate = "";
  }
}
