import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { LoanCalculatorModel } from '../../domain/models';
import { LoanCalculatorPort } from '../ports/in';

@Injectable()
export class LoanCalculatorService implements LoanCalculatorPort {
  private readonly loanCalculator: LoanCalculatorModel;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.loanCalculator = new LoanCalculatorModel();
  }

  async calculateMonthlyPayment(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number> {
    const cacheKey = `loan:monthly_payment:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      let monthlyPayment: number;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numberOfPayments;
      } else {
        monthlyPayment = loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      }

      await this.cacheManager.set(cacheKey, monthlyPayment);
      console.log(`💾 Salvo no cache: ${cacheKey} = ${monthlyPayment}`);

      return monthlyPayment;
    } catch (error) {
      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      if (monthlyRate === 0) {
        return loanAmount / numberOfPayments;
      } else {
        return loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      }
    }
  }

  async calculateTotalInterest(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<number> {
    const cacheKey = `loan:total_interest:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;

    try {
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== null && cachedResult !== undefined) {
        console.log(`✅ Cache HIT: ${cacheKey} = ${cachedResult}`);
        return cachedResult;
      }


      const monthlyPayment = await this.calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermInYears);
      const totalPaid = monthlyPayment * loanTermInYears * 12;
      const totalInterest = totalPaid - loanAmount;

      await this.cacheManager.set(cacheKey, totalInterest);

      return totalInterest;
    } catch (error) {
      const monthlyPayment = await this.calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermInYears);
      const totalPaid = monthlyPayment * loanTermInYears * 12;
      return totalPaid - loanAmount;
    }
  }

  async calculateAmortizationSchedule(
    loanAmount: number,
    annualInterestRate: number,
    loanTermInYears: number
  ): Promise<Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>> {
    const cacheKey = `loan:amortization:${loanAmount}:${annualInterestRate}:${loanTermInYears}`;

    try {
      const cachedResult = await this.cacheManager.get<Array<{
        month: number;
        payment: number;
        principal: number;
        interest: number;
        balance: number;
      }>>(cacheKey);

      if (cachedResult !== null && cachedResult !== undefined) {
        return cachedResult;
      }


      const monthlyPayment = await this.calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermInYears);
      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      const schedule: Array<{
        month: number;
        payment: number;
        principal: number;
        interest: number;
        balance: number;
      }> = [];

      let remainingBalance = loanAmount;

      for (let month = 1; month <= numberOfPayments; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        if (month === numberOfPayments && remainingBalance < 0) {
          remainingBalance = 0;
        }

        schedule.push({
          month,
          payment: Number(monthlyPayment.toFixed(2)),
          principal: Number(principalPayment.toFixed(2)),
          interest: Number(interestPayment.toFixed(2)),
          balance: Number(Math.max(0, remainingBalance).toFixed(2))
        });
      }

      await this.cacheManager.set(cacheKey, schedule);

      return schedule;
    } catch (error) {

      const monthlyPayment = await this.calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermInYears);
      const monthlyRate = annualInterestRate / 100 / 12;
      const numberOfPayments = loanTermInYears * 12;

      const schedule: Array<{
        month: number;
        payment: number;
        principal: number;
        interest: number;
        balance: number;
      }> = [];

      let remainingBalance = loanAmount;

      for (let month = 1; month <= numberOfPayments; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

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
  }

  async calculateLoanCapacity(
    monthlyIncome: number,
    monthlyExpenses: number,
    annualInterestRate: number,
    loanTermInYears: number,
    debtToIncomeRatio: number = 0.28
  ): Promise<{ maxLoanAmount: number; maxMonthlyPayment: number }> {
    const cacheKey = `loan:capacity:${monthlyIncome}:${monthlyExpenses}:${annualInterestRate}:${loanTermInYears}:${debtToIncomeRatio}`;

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

      await this.cacheManager.set(cacheKey, result);

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