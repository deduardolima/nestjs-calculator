import { Injectable } from '@nestjs/common';
import { PercentageCalculatorPort } from '../ports/in/percentage-calculator.port';
import { PercentageCalculatorModel } from '../../domain/models/percentage-calculator.model';

@Injectable()
export class PercentageCalculatorService implements PercentageCalculatorPort {
  private readonly percentageCalculator: PercentageCalculatorModel;

  constructor() {
    this.percentageCalculator = new PercentageCalculatorModel();
  }

  calculatePercentageChange(value: number, percentage: number, isIncrease: boolean): number {
    return this.percentageCalculator.calculatePercentageChange(value, percentage, isIncrease);
  }

  calculatePercentageOf(part: number, whole: number): number {
    return this.percentageCalculator.calculatePercentageOf(part, whole);
  }

  calculatePercentageDifference(value1: number, value2: number): number {
    return this.percentageCalculator.calculatePercentageDifference(value1, value2);
  }
}