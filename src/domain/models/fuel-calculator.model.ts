export class FuelCalculatorModel {
  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): number {
    if (isKmPerLiter) {
      return distance / fuelUsed; // km/l
    } else {
      return (fuelUsed * 100) / distance; // l/100km
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