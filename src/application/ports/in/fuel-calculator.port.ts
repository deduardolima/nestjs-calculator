export interface FuelCalculatorPort {
  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): number;
  calculateTotalCost(distance: number, consumption: number, fuelPrice: number, isKmPerLiter: boolean): number;
}