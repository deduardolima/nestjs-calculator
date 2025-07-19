export interface InvestmentCalculatorPort {
  calculateFutureValue(
    initialInvestment: number,
    monthlyDeposit: number,
    annualInterestRate: number,
    years: number
  ): Promise<number>;
}