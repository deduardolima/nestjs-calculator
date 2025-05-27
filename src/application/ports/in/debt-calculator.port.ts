export interface DebtCalculatorPort {
  calculateMonthlyPayment(totalDebt: number, annualInterestRate: number, months: number): number;
  calculateTimeToPayOff(totalDebt: number, annualInterestRate: number, monthlyPayment: number): number;
}