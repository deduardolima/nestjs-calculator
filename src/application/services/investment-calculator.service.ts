import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InvestmentCalculatorModel } from '../../domain/models';
import { InvestmentCalculatorPort } from '../ports/in';

@Injectable()
export class InvestmentCalculatorService implements InvestmentCalculatorPort {
  private readonly investmentCalculator: InvestmentCalculatorModel;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.investmentCalculator = new InvestmentCalculatorModel();
  }

  async calculateFutureValue(
    initialInvestment: number,
    monthlyDeposit: number,
    annualInterestRate: number,
    years: number
  ): Promise<number> {
    const cacheKey = `investment:future_value:${initialInvestment}:${monthlyDeposit}:${annualInterestRate}:${years}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = this.investmentCalculator.calculateFutureValue(
        initialInvestment,
        monthlyDeposit,
        annualInterestRate,
        years
      );

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.investmentCalculator.calculateFutureValue(
        initialInvestment,
        monthlyDeposit,
        annualInterestRate,
        years
      );
    }
  }

  async calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    frequency: number = 12
  ): Promise<number> {
    const cacheKey = `investment:compound_interest:${principal}:${rate}:${time}:${frequency}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = principal * Math.pow(1 + rate / frequency, frequency * time);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return principal * Math.pow(1 + rate / frequency, frequency * time);
    }
  }

  async calculateSimpleInterest(
    principal: number,
    rate: number,
    time: number
  ): Promise<number> {
    const cacheKey = `investment:simple_interest:${principal}:${rate}:${time}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = principal * (1 + rate * time);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return principal * (1 + rate * time);
    }
  }

  async calculateROI(
    initialInvestment: number,
    finalValue: number
  ): Promise<{ roi: number; roiPercentage: number }> {
    const cacheKey = `investment:roi:${initialInvestment}:${finalValue}`;

    try {
      const cachedResult = await this.cacheManager.get<{ roi: number; roiPercentage: number }>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const roi = finalValue - initialInvestment;
      const roiPercentage = (roi / initialInvestment) * 100;
      const result = { roi, roiPercentage };

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      const roi = finalValue - initialInvestment;
      const roiPercentage = (roi / initialInvestment) * 100;
      return { roi, roiPercentage };
    }
  }

  async calculatePresentValue(
    futureValue: number,
    rate: number,
    time: number,
    frequency: number = 12
  ): Promise<number> {
    const cacheKey = `investment:present_value:${futureValue}:${rate}:${time}:${frequency}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const result = futureValue / Math.pow(1 + rate / frequency, frequency * time);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      return futureValue / Math.pow(1 + rate / frequency, frequency * time);
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.cacheManager.clear();
      console.log('🧹 Cache limpo com sucesso');
    } catch (error) {
      throw new Error('Falha ao limpar cache');
    }
  }

  async deleteCacheKey(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      console.log(`🗑️ Chave removida: ${key}`);
    } catch (error) {
      throw new Error('Falha ao remover chave');
    }
  }


}