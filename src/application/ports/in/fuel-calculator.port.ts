export interface FuelCalculatorPort {
  calculateAverageConsumption(distance: number, fuelUsed: number, isKmPerLiter: boolean): Promise<number>;
  calculateTotalCost(distance: number, consumption: number, fuelPrice: number, isKmPerLiter: boolean): Promise<number>;

  calculateDriverProjection(
    earningsPerKm: number,
    monthlyTarget: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number
  ): Promise<{
    totalKmPerMonth: number;
    kmPerDay: number;
    workingDaysPerMonth: number;
    grossEarnings: number;
    totalFuelCost: number;
    netEarnings: number;
    costPerKm: number;
    netEarningsPerKm: number;
    fuelLitersPerDay: number;
    fuelCostPerDay: number;
  }>;

  calculateEarningsProjection(
    earningsPerKm: number,
    kmPerDay: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number,
    additionalCosts?: number
  ): {
    monthlyGrossEarnings: number;
    monthlyFuelCost: number;
    monthlyAdditionalCosts: number;
    monthlyNetEarnings: number;
    totalKmPerMonth: number;
    workingDaysPerMonth: number;
    costPerKm: number;
    netEarningsPerKm: number;
    profitMargin: number;
    viabilityStatus: string;
    recommendations: string[];
    dailyMetrics: {
      dailyGrossEarnings: number;
      dailyFuelCost: number;
      dailyNetEarnings: number;
      fuelLitersPerDay: number;
    };
  };
}