import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DebtCalculatorModel } from '~/domain/models';
import { DebtCalculatorPort } from '../ports/in';



@Injectable()
export class DebtCalculatorService implements DebtCalculatorPort {
  private readonly debtCalculator: DebtCalculatorModel;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.debtCalculator = new DebtCalculatorModel();
  }
  getCacheStats(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  clearCacheByKeys(keys: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async calculateMonthlyPayment(
    totalDebt: number,
    annualInterestRate: number,
    months: number
  ): Promise<number> {
    const cacheKey = `debt:monthly_payment:${totalDebt}:${annualInterestRate}:${months}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = this.debtCalculator.calculateMonthlyPayment(
        totalDebt,
        annualInterestRate,
        months
      );

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.debtCalculator.calculateMonthlyPayment(
        totalDebt,
        annualInterestRate,
        months
      );
    }
  }

  async calculateTimeToPayOff(
    totalDebt: number,
    annualInterestRate: number,
    monthlyPayment: number
  ): Promise<number> {
    const cacheKey = `debt:time_to_payoff:${totalDebt}:${annualInterestRate}:${monthlyPayment}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = this.debtCalculator.calculateTimeToPayOff(
        totalDebt,
        annualInterestRate,
        monthlyPayment
      );

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.debtCalculator.calculateTimeToPayOff(
        totalDebt,
        annualInterestRate,
        monthlyPayment
      );
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