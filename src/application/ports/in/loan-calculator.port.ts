export interface LoanCalculatorPort {
  calculateMonthlyPayment(loanAmount: number, annualInterestRate: number, months: number): number;
  calculateTotalPayment(monthlyPayment: number, months: number): number;
  calculateTotalInterest(loanAmount: number, totalPayment: number): number;
}