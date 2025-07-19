import { Injectable } from '@nestjs/common';
import { PercentageCalculatorModel } from '~/domain/models';
import { PercentageCalculatorPort } from '../ports/in';


import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class PercentageCalculatorService implements PercentageCalculatorPort {
  private readonly percentageCalculator: PercentageCalculatorModel;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.percentageCalculator = new PercentageCalculatorModel();
  }

  async calculatePercentage(
    value: number,
    percentage: number
  ): Promise<number> {
    const cacheKey = `percentage:calculate:${value}:${percentage}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      const result = (value * percentage) / 100;

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return (value * percentage) / 100;
    }
  }

  async calculatePercentageOf(
    part: number,
    total: number
  ): Promise<number> {
    const cacheKey = `percentage:percentage_of:${part}:${total}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      if (total === 0) {
        throw new Error('Total não pode ser zero');
      }

      const result = (part / total) * 100;

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      if (total === 0) {
        throw new Error('Total não pode ser zero');
      }
      return (part / total) * 100;
    }
  }

  async calculatePercentageChange(
    oldValue: number,
    newValue: number
  ): Promise<number> {
    const cacheKey = `percentage:change:${oldValue}:${newValue}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      if (oldValue === 0) {
        throw new Error('Valor inicial não pode ser zero');
      }

      const result = ((newValue - oldValue) / oldValue) * 100;

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      if (oldValue === 0) {
        throw new Error('Valor inicial não pode ser zero');
      }
      return ((newValue - oldValue) / oldValue) * 100;
    }
  }

  async calculateValueFromPercentage(
    percentage: number,
    percentageValue: number
  ): Promise<number> {
    const cacheKey = `percentage:value_from:${percentage}:${percentageValue}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      if (percentage === 0) {
        throw new Error('Percentual não pode ser zero');
      }

      const result = (percentageValue * 100) / percentage;

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      if (percentage === 0) {
        throw new Error('Percentual não pode ser zero');
      }
      return (percentageValue * 100) / percentage;
    }
  }

  async calculateDiscount(
    originalPrice: number,
    discountPercentage: number
  ): Promise<{ discountAmount: number; finalPrice: number }> {
    const cacheKey = `percentage:discount:${originalPrice}:${discountPercentage}`;

    try {
      const cachedResult = await this.cacheManager.get<{ discountAmount: number; finalPrice: number }>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      const discountAmount = await this.calculatePercentage(originalPrice, discountPercentage);
      const finalPrice = originalPrice - discountAmount;

      const result = { discountAmount, finalPrice };

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      const discountAmount = await this.calculatePercentage(originalPrice, discountPercentage);
      const finalPrice = originalPrice - discountAmount;
      return { discountAmount, finalPrice };
    }
  }

  async calculateMarkup(
    originalPrice: number,
    markupPercentage: number
  ): Promise<{ markupAmount: number; finalPrice: number }> {
    const cacheKey = `percentage:markup:${originalPrice}:${markupPercentage}`;

    try {
      const cachedResult = await this.cacheManager.get<{ markupAmount: number; finalPrice: number }>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      const markupAmount = await this.calculatePercentage(originalPrice, markupPercentage);
      const finalPrice = originalPrice + markupAmount;

      const result = { markupAmount, finalPrice };

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      const markupAmount = await this.calculatePercentage(originalPrice, markupPercentage);
      const finalPrice = originalPrice + markupAmount;
      return { markupAmount, finalPrice };
    }
  }

  async calculateProfitMargin(
    revenue: number,
    cost: number
  ): Promise<{ profit: number; marginPercentage: number }> {
    const cacheKey = `percentage:profit_margin:${revenue}:${cost}`;

    try {
      const cachedResult = await this.cacheManager.get<{ profit: number; marginPercentage: number }>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      if (revenue === 0) {
        throw new Error('Receita não pode ser zero');
      }

      const profit = revenue - cost;
      const marginPercentage = (profit / revenue) * 100;

      const result = { profit, marginPercentage };

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      if (revenue === 0) {
        throw new Error('Receita não pode ser zero');
      }
      const profit = revenue - cost;
      const marginPercentage = (profit / revenue) * 100;
      return { profit, marginPercentage };
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