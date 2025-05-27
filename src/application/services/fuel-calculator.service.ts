import { Injectable } from '@nestjs/common';
import { FuelCalculatorPort } from '../ports/in/fuel-calculator.port';
import { FuelCalculatorModel } from '../../domain/models/fuel-calculator.model';

@Injectable()
export class FuelCalculatorService implements FuelCalculatorPort {
  private readonly fuelCalculator: FuelCalculatorModel;

  constructor() {
    this.fuelCalculator = new FuelCalculatorModel();
  }

  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): number {
    return this.fuelCalculator.calculateAverageConsumption(distance, fuelUsed, isKmPerLiter);
  }

  calculateTotalCost(distance: number, consumption: number, fuelPrice: number, isKmPerLiter: boolean): number {
    return this.fuelCalculator.calculateTotalCost(distance, consumption, fuelPrice, isKmPerLiter);
  }
}