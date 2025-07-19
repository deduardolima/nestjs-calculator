export class InvestmentCalculatorModel {
  calculateFutureValue(
    initialInvestment: number,
    monthlyDeposit: number,
    annualInterestRate: number,
    years: number
  ): number {
    const monthlyRate = annualInterestRate / 100 / 12;
    const months = years * 12;

    const initialFV = initialInvestment * Math.pow(1 + monthlyRate, months);

    const depositFV = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return initialFV + depositFV;
  }
}