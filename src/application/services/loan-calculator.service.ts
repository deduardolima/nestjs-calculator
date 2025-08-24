import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AmortizationScheduleItem, LoanCalculatorPort } from '../ports/in';

@Injectable()
export class LoanCalculatorService implements LoanCalculatorPort {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private _calculateMonthlyPaymentInternal(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): number {
    if (loanAmount <= 0) throw new Error('Valor do empréstimo deve ser positivo');
    if (annualInterestRate < 0) throw new Error('Taxa de juros não pode ser negativa');
    if (loanTermInYears <= 0) throw new Error('Prazo deve ser positivo');

    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTermInYears * 12;

    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

      if (denominator === 0) {
        throw new Error('Erro no cálculo: denominador zero');
      }

      monthlyPayment = loanAmount * (numerator / denominator);
    }

    return monthlyPayment;
  }

  async calculateMonthlyPayment(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number> {
    const cacheKey = `loan:monthly_payment:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;
    const CACHE_TTL = 3600;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const monthlyPayment = this._calculateMonthlyPaymentInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );

      await this.cacheManager.set(cacheKey, monthlyPayment, CACHE_TTL);

      return monthlyPayment;
    } catch (error) {
      console.error(`Cache error for ${cacheKey}:`, error);
      return this._calculateMonthlyPaymentInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );
    }
  }

  private async _calculateTotalInterestInternal(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number> {
    const monthlyPayment = await this.calculateMonthlyPayment(
      loanAmount,
      annualInterestRate,
      loanTermInYears
    );
    const totalPaid = monthlyPayment * loanTermInYears * 12;
    const totalInterest = totalPaid - loanAmount;
    return totalInterest;
  }

  async calculateTotalInterest(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number> {
    const cacheKey = `loan:total_interest:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;
    const CACHE_TTL = 3600;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const totalInterest = await this._calculateTotalInterestInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );

      await this.cacheManager.set(cacheKey, totalInterest, CACHE_TTL);

      return totalInterest;
    } catch (error) {
      return this._calculateTotalInterestInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );
    }
  }

  private async _calculateAmortizationScheduleInternal(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<AmortizationScheduleItem[]> {
    const monthlyPayment = await this.calculateMonthlyPayment(
      loanAmount,
      annualInterestRate,
      loanTermInYears
    );
    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTermInYears * 12;

    const schedule: AmortizationScheduleItem[] = [];
    let remainingBalance = loanAmount;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;

      if (month === numberOfPayments) {
        principalPayment = remainingBalance;
        remainingBalance = 0;
      } else {
        remainingBalance -= principalPayment;
        if (Math.abs(remainingBalance) < 0.01) {
          remainingBalance = 0;
        }
      }

      schedule.push({
        month,
        payment: Number(monthlyPayment.toFixed(2)),
        principal: Number(principalPayment.toFixed(2)),
        interest: Number(interestPayment.toFixed(2)),
        balance: Number(Math.max(0, remainingBalance).toFixed(2))
      });
    }

    return schedule;
  }

  async calculateAmortizationSchedule(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<AmortizationScheduleItem[]> {
    const cacheKey = `loan:amortization:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;
    const CACHE_TTL = 3600;

    try {
      const cachedResult = await this.cacheManager.get<AmortizationScheduleItem[]>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const schedule = await this._calculateAmortizationScheduleInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );

      await this.cacheManager.set(cacheKey, schedule, CACHE_TTL);

      return schedule;
    } catch (error) {
      return this._calculateAmortizationScheduleInternal(
        loanAmount,
        annualInterestRate,
        loanTermInYears
      );
    }
  }

  async calculateLoanCapacity(
    monthlyIncome: number,
    monthlyExpenses: number,
    annualInterestRate: number,
    loanTermInYears: number,
    debtToIncomeRatio: number = 0.28
  ): Promise<{ maxLoanAmount: number; maxMonthlyPayment: number }> {
    const cacheKey = `loan:capacity:${monthlyIncome}:${monthlyExpenses}:${annualInterestRate}:${loanTermInYears}:${debtToIncomeRatio}`;
    const CACHE_TTL = 3600;

    try {
      const cachedResult = await this.cacheManager.get<{ maxLoanAmount: number; maxMonthlyPayment: number }>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }

      const availableIncome = monthlyIncome - monthlyExpenses;
      const maxMonthlyPayment = Math.min(availableIncome, monthlyIncome * debtToIncomeRatio);

      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      let maxLoanAmount: number;
      if (monthlyRate === 0) {
        maxLoanAmount = maxMonthlyPayment * numberOfPayments;
      } else {
        maxLoanAmount = maxMonthlyPayment *
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
      }

      const result = {
        maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
        maxMonthlyPayment: Number(maxMonthlyPayment.toFixed(2))
      };

      await this.cacheManager.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {

      const availableIncome = monthlyIncome - monthlyExpenses;
      const maxMonthlyPayment = Math.min(availableIncome, monthlyIncome * debtToIncomeRatio);

      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      let maxLoanAmount: number;
      if (monthlyRate === 0) {
        maxLoanAmount = maxMonthlyPayment * numberOfPayments;
      } else {
        maxLoanAmount = maxMonthlyPayment *
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
      }

      return {
        maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
        maxMonthlyPayment: Number(maxMonthlyPayment.toFixed(2))
      };
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