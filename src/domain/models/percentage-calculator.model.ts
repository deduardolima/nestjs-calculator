export class PercentageCalculatorModel {
  calculatePercentageChange(value: number, percentage: number, isIncrease: boolean): number {
    const factor = percentage / 100;
    return isIncrease ? value * (1 + factor) : value * (1 - factor);
  }

  calculatePercentageOf(part: number, whole: number): number {
    return (part / whole) * 100;
  }

  calculatePercentageDifference(value1: number, value2: number): number {
    const difference = Math.abs(value1 - value2);
    const base = Math.min(value1, value2);
    return (difference / base) * 100;
  }
}