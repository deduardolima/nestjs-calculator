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