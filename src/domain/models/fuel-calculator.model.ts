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
  calculateDriverProjection(
    earningsPerKm: number,
    monthlyTarget: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number
  ): {
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
  } {
    if (earningsPerKm <= 0) {
      throw new Error('Ganho por KM deve ser maior que zero');
    }
    if (monthlyTarget <= 0) {
      throw new Error('Meta mensal deve ser maior que zero');
    }
    if (fuelPrice <= 0) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    if (fuelEfficiency <= 0) {
      throw new Error('Autonomia deve ser maior que zero');
    }
    if (workingDaysPerWeek < 1 || workingDaysPerWeek > 7) {
      throw new Error('Dias de trabalho deve estar entre 1 e 7');
    }

    const costPerKm = fuelPrice / fuelEfficiency;
    const netEarningsPerKm = earningsPerKm - costPerKm;

    if (netEarningsPerKm <= 0) {
      throw new Error('O ganho por KM não cobre nem o custo do combustível! Revise os valores.');
    }
    const totalKmPerMonth = monthlyTarget / netEarningsPerKm;
    const workingDaysPerMonth = (workingDaysPerWeek / 7) * 30;
    const kmPerDay = totalKmPerMonth / workingDaysPerMonth;
    const totalFuelCost = totalKmPerMonth * costPerKm;
    const grossEarnings = totalKmPerMonth * earningsPerKm;
    const averageSpeedKmH = 30;
    const fuelLitersPerDay = kmPerDay / fuelEfficiency;
    const fuelCostPerDay = fuelLitersPerDay * fuelPrice;

    return {
      totalKmPerMonth,
      kmPerDay,
      workingDaysPerMonth,
      grossEarnings,
      totalFuelCost,
      netEarnings: monthlyTarget,
      costPerKm,
      netEarningsPerKm,
      fuelLitersPerDay,
      fuelCostPerDay
    };
  }

  calculateEarningsProjection(
    earningsPerKm: number,
    kmPerDay: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number,
    additionalCosts: number = 0
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
  } {
    if (earningsPerKm <= 0) {
      throw new Error('Ganho por KM deve ser maior que zero');
    }
    if (kmPerDay <= 0 || kmPerDay > 1000) {
      throw new Error('KM por dia deve estar entre 1 e 1000');
    }
    if (fuelPrice <= 0) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    if (fuelEfficiency <= 0) {
      throw new Error('Autonomia deve ser maior que zero');
    }
    if (workingDaysPerWeek < 1 || workingDaysPerWeek > 7) {
      throw new Error('Dias de trabalho deve estar entre 1 e 7');
    }
    if (additionalCosts < 0) {
      throw new Error('Custos adicionais não podem ser negativos');
    }

    const workingDaysPerMonth = (workingDaysPerWeek / 7) * 30;
    const totalKmPerMonth = kmPerDay * workingDaysPerMonth;
    const costPerKm = fuelPrice / fuelEfficiency;
    const monthlyGrossEarnings = totalKmPerMonth * earningsPerKm;
    const monthlyFuelCost = totalKmPerMonth * costPerKm;
    const monthlyNetEarnings = monthlyGrossEarnings - monthlyFuelCost - additionalCosts;
    const netEarningsPerKm = earningsPerKm - costPerKm;
    const averageSpeedKmH = 30;
    const profitMargin = monthlyGrossEarnings > 0 ? (monthlyNetEarnings / monthlyGrossEarnings) * 100 : 0;
    const dailyGrossEarnings = kmPerDay * earningsPerKm;
    const fuelLitersPerDay = kmPerDay / fuelEfficiency;
    const dailyFuelCost = fuelLitersPerDay * fuelPrice;
    const dailyNetEarnings = dailyGrossEarnings - dailyFuelCost - (additionalCosts / workingDaysPerMonth);

    let viabilityStatus = 'VIÁVEL';
    const recommendations: string[] = [];

    if (monthlyNetEarnings <= 0) {
      viabilityStatus = 'INVIÁVEL';
      recommendations.push('❌ Ganhos não cobrem os custos');
    } else if (netEarningsPerKm <= 0) {
      viabilityStatus = 'INVIÁVEL';
      recommendations.push('❌ Ganho por KM não cobre nem o combustível');
    } else if (profitMargin < 20) {
      viabilityStatus = 'RISCO';
      recommendations.push('⚠️ Margem de lucro muito baixa (<20%)');
    } else if (profitMargin < 40) {
      viabilityStatus = 'ATENÇÃO';
      recommendations.push('⚠️ Margem de lucro baixa (<40%)');
    }

    if (kmPerDay > 600) {
      viabilityStatus = 'INVIÁVEL';
      recommendations.push('Mais de 600km/dia é irrealista');
    } else if (kmPerDay > 400) {
      if (viabilityStatus === 'VIÁVEL') viabilityStatus = 'ATENÇÃO';
      recommendations.push('⚠️ Mais de 400km/dia é muito desgastante');
    }

    if (profitMargin < 60 && viabilityStatus !== 'INVIÁVEL') {
      recommendations.push('💡 Tente negociar melhor valor por KM');
    }

    if (fuelEfficiency < 12) {
      recommendations.push('💡 Considere um carro mais econômico (>12km/l)');
    }

    if (workingDaysPerWeek < 6 && monthlyNetEarnings < 5000) {
      recommendations.push('💡 Trabalhar mais dias pode aumentar os ganhos');
    }

    if (additionalCosts > monthlyNetEarnings * 0.2) {
      recommendations.push('💡 Revise os custos adicionais (>20% dos ganhos)');
    }

    if (viabilityStatus === 'VIÁVEL' && profitMargin > 60) {
      recommendations.push('✅ Excelente margem de lucro!');
    }

    return {
      monthlyGrossEarnings,
      monthlyFuelCost,
      monthlyAdditionalCosts: additionalCosts,
      monthlyNetEarnings,
      totalKmPerMonth,
      workingDaysPerMonth,
      costPerKm,
      netEarningsPerKm,
      profitMargin,
      viabilityStatus,
      recommendations,
      dailyMetrics: {
        dailyGrossEarnings,
        dailyFuelCost,
        dailyNetEarnings,
        fuelLitersPerDay
      }
    };
  }
}