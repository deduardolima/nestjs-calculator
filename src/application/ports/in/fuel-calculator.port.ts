export interface FuelCalculatorPort {
  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): Promise<number>;
  calculateTotalCost(distance: number, consumption: number, fuelPrice: number, isKmPerLiter: boolean): Promise<number>;
}