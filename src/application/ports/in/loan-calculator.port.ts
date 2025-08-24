export interface AmortizationScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

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
  ): Promise<AmortizationScheduleItem[]>;

  calculateLoanCapacity(
    monthlyIncome: number,
    monthlyExpenses: number,
    annualInterestRate: number,
    loanTermInYears: number,
    debtToIncomeRatio?: number
  ): Promise<{ maxLoanAmount: number; maxMonthlyPayment: number }>;

  clearCache(): Promise<void>;
  deleteCacheKey(key: string): Promise<void>;
}