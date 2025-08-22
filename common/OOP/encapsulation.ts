class BankAccount {
  private _balance: number;

  constructor(initialBalance: number) {
    this._balance = initialBalance;
  }

  public get balance() {
    return this._balance;
  }

  public deposit(amount: number) {
    if (amount <= 0) {
      console.log("Amount must be positive");
      return;
    }
    this._balance += amount;
  }

  public withdraw(amount: number) {
    if (this.balance - amount < 0) {
      console.log("Insufficient funds");
      return;
    }
    this._balance -= amount;
  }
}