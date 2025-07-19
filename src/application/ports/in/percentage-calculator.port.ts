export interface PercentageCalculatorPort {
  calculatePercentage(
    value: number,
    percentage: number
  ): Promise<number>;

  calculatePercentageOf(
    part: number,
    total: number
  ): Promise<number>;

  calculatePercentageChange(
    oldValue: number,
    newValue: number
  ): Promise<number>;

  calculateValueFromPercentage(
    percentage: number,
    percentageValue: number
  ): Promise<number>;
}