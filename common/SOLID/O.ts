interface Costumer {
  getDiscount(): number;
}

class RegularCostumer implements Costumer {
  getDiscount(): number {
    return 0;
  }
}

class PremiumCostumer implements Costumer {
  getDiscount(): number {
    return 10;
  }
}

class Discount {
  calculateDiscount(costumer: Costumer): number {
    return costumer.getDiscount();
  }
}

const discount = new Discount();
const regularCostumer = new RegularCostumer();
const premiumCostumer = new PremiumCostumer();

console.log(discount.calculateDiscount(regularCostumer));
console.log(discount.calculateDiscount(premiumCostumer));
