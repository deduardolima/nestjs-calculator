export class FuelCalculatorModel {
  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): number {
    if (isKmPerLiter) {
      return distance / fuelUsed;
    } else {
      return (fuelUsed * 100) / distance;
    }
  }

  calculateTotalCost(distance: number, consumption: number, fuelPrice: number, isKmPerLiter: boolean): number {
    let fuelNeeded: number;

    if (isKmPerLiter) {
      fuelNeeded = distance / consumption;
    } else {
      fuelNeeded = (consumption * distance) / 100;
    }

    return fuelNeeded * fuelPrice;
  }
}