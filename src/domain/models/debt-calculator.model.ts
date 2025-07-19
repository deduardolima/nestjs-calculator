export class DebtCalculatorModel {
  calculateMonthlyPayment(totalDebt: number, annualInterestRate: number, months: number): number {
    const monthlyRate = annualInterestRate / 100 / 12;
    return (totalDebt * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  calculateTimeToPayOff(totalDebt: number, annualInterestRate: number, monthlyPayment: number): number {
    const monthlyRate = annualInterestRate / 100 / 12;
    return -Math.log(1 - (totalDebt * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
  }
}