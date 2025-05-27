import { Module } from '@nestjs/common';
import { FuelCalculatorService } from '../../application/services/fuel-calculator.service';
import { PercentageCalculatorService } from '../../application/services/percentage-calculator.service';
import { DebtCalculatorService } from '../../application/services/debt-calculator.service';
import { InvestmentCalculatorService } from '../../application/services/investment-calculator.service';
import { LoanCalculatorService } from '../../application/services/loan-calculator.service';
import { FuelCalculatorController } from '../adapters/in/controllers/fuel-calculator.controller';
import { PercentageCalculatorController } from '../adapters/in/controllers/percentage-calculator.controller';
import { DebtCalculatorController } from '../adapters/in/controllers/debt-calculator.controller';
import { InvestmentCalculatorController } from '../adapters/in/controllers/investment-calculator.controller';
import { LoanCalculatorController } from '../adapters/in/controllers/loan-calculator.controller';

@Module({
  imports: [],
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
export class AppModule {}