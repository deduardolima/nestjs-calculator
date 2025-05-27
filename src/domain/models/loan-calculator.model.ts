export class LoanCalculatorModel {
  calculateMonthlyPayment(loanAmount: number, annualInterestRate: number, months: number): number {
    const monthlyRate = annualInterestRate / 100 / 12;
    return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  calculateTotalPayment(monthlyPayment: number, months: number): number {
    return monthlyPayment * months;
  }

  calculateTotalInterest(loanAmount: number, totalPayment: number): number {
    return totalPayment - loanAmount;
  }
}