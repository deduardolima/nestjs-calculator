import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { DebtCalculatorService, FuelCalculatorService, InvestmentCalculatorService, LoanCalculatorService, PercentageCalculatorService } from './application/services';
import { DebtCalculatorController, FuelCalculatorController, InvestmentCalculatorController, LoanCalculatorController, PercentageCalculatorController } from './infrastructure/adapters/in/controllers';


@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL || '3600') * 1000,
      max: 1000,
    }),
  ],
  controllers: [
    FuelCalculatorController,
    PercentageCalculatorController,
    DebtCalculatorController,
    InvestmentCalculatorController,
    LoanCalculatorController,
  ],
  providers: [
    FuelCalculatorService,
    PercentageCalculatorService,
    DebtCalculatorService,
    InvestmentCalculatorService,
    LoanCalculatorService,
  ],
})
export class AppModule { }