export interface LoanCalculatorPort {
  calculateMonthlyPayment(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number>;

  calculateTotalInterest(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number>;

  calculateAmortizationSchedule(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>>;
}