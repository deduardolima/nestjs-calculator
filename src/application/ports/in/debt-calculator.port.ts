export interface DebtCalculatorPort {
  calculateMonthlyPayment(
    totalDebt: number,
    annualInterestRate: number,
    months: number
  ): Promise<number>;

  calculateTimeToPayOff(
    totalDebt: number,
    annualInterestRate: number,
    monthlyPayment: number
  ): Promise<number>;

  clearCache(pattern?: string): Promise<void>;
  clearCacheByKeys(keys: string[]): Promise<void>;
  getCacheStats(): Promise<any>;
}