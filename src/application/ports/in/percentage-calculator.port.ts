export interface PercentageCalculatorPort {
  calculatePercentageChange(value: number, percentage: number, isIncrease: boolean): number;
  calculatePercentageOf(part: number, whole: number): number;
  calculatePercentageDifference(value1: number, value2: number): number;
}