import { Injectable } from '@nestjs/common';
import { DebtCalculatorPort } from '../ports/in/debt-calculator.port';
import { DebtCalculatorModel } from '../../domain/models/debt-calculator.model';

@Injectable()
export class DebtCalculatorService implements DebtCalculatorPort {
  private readonly debtCalculator: DebtCalculatorModel;

  constructor() {
    this.debtCalculator = new DebtCalculatorModel();
  }

  calculateMonthlyPayment(totalDebt: number, annualInterestRate: number, months: number): number {
    return this.debtCalculator.calculateMonthlyPayment(totalDebt, annualInterestRate, months);
  }

  calculateTimeToPayOff(totalDebt: number, annualInterestRate: number, monthlyPayment: number): number {
    return this.debtCalculator.calculateTimeToPayOff(totalDebt, annualInterestRate, monthlyPayment);
  }
}