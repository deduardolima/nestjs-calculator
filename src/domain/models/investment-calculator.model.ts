export class InvestmentCalculatorModel {
  calculateFutureValue(
    initialInvestment: number,
    monthlyDeposit: number,
    annualInterestRate: number,
    years: number
  ): number {
    const monthlyRate = annualInterestRate / 100 / 12;
    const months = years * 12;
    
    // Future value of initial investment
    const initialFV = initialInvestment * Math.pow(1 + monthlyRate, months);
    
    // Future value of regular deposits
    const depositFV = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    return initialFV + depositFV;
  }
}