import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestmentCalculatorService } from '../../../../application/services/investment-calculator.service';
import { FutureValueDto } from './dtos/investment-calculator.dto';

@ApiTags('Calculadora de Investimentos')
@Controller('calculators/investment')
export class InvestmentCalculatorController {
  constructor(private readonly investmentCalculatorService: InvestmentCalculatorService) {}

  @Post('future-value')
  @ApiOperation({ summary: 'Calcula o valor futuro de um investimento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Valor futuro calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        futureValue: {
          type: 'number',
          example: 87634.21,
          description: 'Valor futuro estimado do investimento'
        }
      }
    }
  })
  calculateFutureValue(@Body() dto: FutureValueDto): { futureValue: number } {
    const futureValue = this.investmentCalculatorService.calculateFutureValue(
      dto.initialInvestment,
      dto.monthlyDeposit,
      dto.annualInterestRate,
      dto.years
    );
    return { futureValue };
  }
}