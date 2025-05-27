import { Injectable } from '@nestjs/common';
import { InvestmentCalculatorPort } from '../ports/in/investment-calculator.port';
import { InvestmentCalculatorModel } from '../../domain/models/investment-calculator.model';

@Injectable()
export class InvestmentCalculatorService implements InvestmentCalculatorPort {
  private readonly investmentCalculator: InvestmentCalculatorModel;

  constructor() {
    this.investmentCalculator = new InvestmentCalculatorModel();
  }

  calculateFutureValue(
    initialInvestment: number,
    monthlyDeposit: number,
    annualInterestRate: number,
    years: number
  ): number {
    return this.investmentCalculator.calculateFutureValue(
      initialInvestment,
      monthlyDeposit,
      annualInterestRate,
      years
    );
  }
}