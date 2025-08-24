import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FuelCalculatorModel } from '../../domain/models';
import { FuelCalculatorPort } from '../ports/in';

@Injectable()
export class FuelCalculatorService implements FuelCalculatorPort {
  private readonly fuelCalculator: FuelCalculatorModel;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.fuelCalculator = new FuelCalculatorModel();
  }

  async calculateAverageConsumption(
    distance: number,
    fuelUsed: number,
    isKmPerLiter: boolean
  ): Promise<number> {
    const cacheKey = `fuel:avg_consumption:${distance}:${fuelUsed}:${isKmPerLiter}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = this.fuelCalculator.calculateAverageConsumption(distance, fuelUsed, isKmPerLiter);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.fuelCalculator.calculateAverageConsumption(distance, fuelUsed, isKmPerLiter);
    }
  }

  async calculateTotalCost(
    distance: number,
    consumption: number,
    fuelPrice: number,
    isKmPerLiter: boolean
  ): Promise<number> {
    const cacheKey = `fuel:total_cost:${distance}:${consumption}:${fuelPrice}:${isKmPerLiter}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = this.fuelCalculator.calculateTotalCost(distance, consumption, fuelPrice, isKmPerLiter);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.fuelCalculator.calculateTotalCost(distance, consumption, fuelPrice, isKmPerLiter);
    }
  }

  async calculateDriverProjection(
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
  }> {
    const cacheKey = `fuel:driver_projection:${earningsPerKm}:${monthlyTarget}:${fuelPrice}:${fuelEfficiency}:${workingDaysPerWeek}`;

    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult as any;
      }

      const result = this.fuelCalculator.calculateDriverProjection(
        earningsPerKm,
        monthlyTarget,
        fuelPrice,
        fuelEfficiency,
        workingDaysPerWeek
      );

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.fuelCalculator.calculateDriverProjection(
        earningsPerKm,
        monthlyTarget,
        fuelPrice,
        fuelEfficiency,
        workingDaysPerWeek
      );
    }
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
    this.validateEarningsProjectionInputs(earningsPerKm, kmPerDay, fuelPrice, fuelEfficiency, workingDaysPerWeek, additionalCosts);

    const basicMetrics = this.calculateBasicMetrics(earningsPerKm, kmPerDay, fuelPrice, fuelEfficiency, workingDaysPerWeek, additionalCosts);
    const viabilityAnalysis = this.analyzeViability(basicMetrics, kmPerDay, workingDaysPerWeek);
    const recommendations = this.generateRecommendations(basicMetrics, kmPerDay, workingDaysPerWeek, fuelEfficiency, additionalCosts);

    return {
      ...basicMetrics,
      viabilityStatus: viabilityAnalysis.status,
      recommendations: [...viabilityAnalysis.recommendations, ...recommendations]
    };
  }

  private validateEarningsProjectionInputs(
    earningsPerKm: number,
    kmPerDay: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number,
    additionalCosts: number
  ): void {
    const validations = [
      { condition: earningsPerKm <= 0, message: 'Ganho por KM deve ser maior que zero' },
      { condition: kmPerDay <= 0 || kmPerDay > 1000, message: 'KM por dia deve estar entre 1 e 1000' },
      { condition: fuelPrice <= 0, message: 'Preço do combustível deve ser maior que zero' },
      { condition: fuelEfficiency <= 0, message: 'Autonomia deve ser maior que zero' },
      { condition: workingDaysPerWeek < 1 || workingDaysPerWeek > 7, message: 'Dias de trabalho deve estar entre 1 e 7' },
      { condition: additionalCosts < 0, message: 'Custos adicionais não podem ser negativos' }
    ];

    for (const validation of validations) {
      if (validation.condition) {
        throw new Error(validation.message);
      }
    }
  }

  private calculateBasicMetrics(
    earningsPerKm: number,
    kmPerDay: number,
    fuelPrice: number,
    fuelEfficiency: number,
    workingDaysPerWeek: number,
    additionalCosts: number
  ) {
    const workingDaysPerMonth = (workingDaysPerWeek / 7) * 30;
    const totalKmPerMonth = kmPerDay * workingDaysPerMonth;

    const costPerKm = fuelPrice / fuelEfficiency;
    const netEarningsPerKm = earningsPerKm - costPerKm;
    const monthlyGrossEarnings = totalKmPerMonth * earningsPerKm;
    const monthlyFuelCost = totalKmPerMonth * costPerKm;
    const monthlyNetEarnings = monthlyGrossEarnings - monthlyFuelCost - additionalCosts;
    const profitMargin = monthlyGrossEarnings > 0 ? (monthlyNetEarnings / monthlyGrossEarnings) * 100 : 0;
    const dailyGrossEarnings = kmPerDay * earningsPerKm;
    const fuelLitersPerDay = kmPerDay / fuelEfficiency;
    const dailyFuelCost = fuelLitersPerDay * fuelPrice;
    const dailyNetEarnings = dailyGrossEarnings - dailyFuelCost - (additionalCosts / workingDaysPerMonth);

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
      dailyMetrics: {
        dailyGrossEarnings,
        dailyFuelCost,
        dailyNetEarnings,
        fuelLitersPerDay
      }
    };
  }

  private analyzeViability(metrics: any, kmPerDay: number, workingDaysPerWeek: number) {
    let status = 'VIÁVEL';
    const recommendations: string[] = [];

    if (metrics.monthlyNetEarnings <= 0) {
      status = 'INVIÁVEL';
      recommendations.push('Ganhos não cobrem os custos totais');
    } else if (metrics.netEarningsPerKm <= 0) {
      status = 'INVIÁVEL';
      recommendations.push('Ganho por KM não cobre nem o combustível');
    } else if (metrics.profitMargin < 15) {
      status = 'RISCO';
      recommendations.push('Margem de lucro muito baixa (<15%)');
    } else if (metrics.profitMargin < 30) {
      status = 'ATENÇÃO';
      recommendations.push('Margem de lucro baixa (<30%)');
    }

    if (kmPerDay > 500) {
      status = 'INVIÁVEL';
      recommendations.push(' Mais de 500km/dia é irrealista para sustentabilidade');
    } else if (kmPerDay > 350) {
      if (status === 'VIÁVEL') status = 'ATENÇÃO';
      recommendations.push('Mais de 350km/dia é muito desgastante');
    }

    return { status, recommendations };
  }

  private generateRecommendations(
    metrics: any,
    kmPerDay: number,
    workingDaysPerWeek: number,
    fuelEfficiency: number,
    additionalCosts: number
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.netEarningsPerKm < 0.80 && metrics.monthlyNetEarnings > 0) {
      recommendations.push('Ganho líquido baixo - negocie melhor valor por KM');
    }

    if (metrics.costPerKm > 0.50) {
      recommendations.push('Custo de combustível alto - considere carro mais econômico');
    }

    if (fuelEfficiency < 12) {
      const currentFuelCost = metrics.monthlyFuelCost;
      const improvedFuelCost = metrics.totalKmPerMonth * (metrics.costPerKm * fuelEfficiency / 12);
      const potentialSavings = currentFuelCost - improvedFuelCost;
      recommendations.push(`Carro mais econômico economizaria ~R$ ${potentialSavings.toFixed(0)}/mês`);
    }

    if (metrics.monthlyNetEarnings < 3000) {
      recommendations.push('Ganho mensal baixo - considere aumentar KM/dia ou valor por KM');
    } else if (metrics.monthlyNetEarnings > 8000) {
      recommendations.push('Excelente ganho mensal!');
    }

    if (metrics.profitMargin > 60) {
      recommendations.push('Excelente margem de lucro!');
    } else if (metrics.profitMargin > 40) {
      recommendations.push('Boa margem de lucro');
    }

    if (metrics.dailyMetrics.dailyNetEarnings > 200) {
      recommendations.push(' Boa rentabilidade diária');
    }

    if (additionalCosts > metrics.monthlyNetEarnings * 0.15) {
      recommendations.push('Custos adicionais altos (>15% dos ganhos)');
    }

    if (workingDaysPerWeek < 6 && metrics.monthlyNetEarnings < 6000) {
      const extraDays = 6 - workingDaysPerWeek;
      const extraEarnings = extraDays * (metrics.dailyMetrics.dailyNetEarnings * 4.33);
      recommendations.push(`Trabalhar ${extraDays} dia(s) a mais renderia +R$ ${extraEarnings.toFixed(0)}/mês`);
    }

    return recommendations;
  }

  async clearCache(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      throw new Error('Falha ao limpar cache');
    }
  }

  async deleteCacheKey(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      throw new Error('Falha ao remover chave');
    }
  }


}