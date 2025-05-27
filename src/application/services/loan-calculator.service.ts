import { Injectable } from '@nestjs/common';
import { LoanCalculatorPort } from '../ports/in/loan-calculator.port';
import { LoanCalculatorModel } from '../../domain/models/loan-calculator.model';

@Injectable()
export class LoanCalculatorService implements LoanCalculatorPort {
  private readonly loanCalculator: LoanCalculatorModel;

  constructor() {
    this.loanCalculator = new LoanCalculatorModel();
  }

  calculateMonthlyPayment(loanAmount: number, annualInterestRate: number, months: number): number {
    return this.loanCalculator.calculateMonthlyPayment(loanAmount, annualInterestRate, months);
  }

  calculateTotalPayment(monthlyPayment: number, months: number): number {
    return this.loanCalculator.calculateTotalPayment(monthlyPayment, months);
  }

  calculateTotalInterest(loanAmount: number, totalPayment: number): number {
    return this.loanCalculator.calculateTotalInterest(loanAmount, totalPayment);
  }
}