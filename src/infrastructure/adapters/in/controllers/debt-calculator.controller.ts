import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DebtCalculatorService } from '../../../../application/services/debt-calculator.service';
import { MonthlyPaymentDto, TimeToPayOffDto } from './dtos/debt-calculator.dto';

@ApiTags('Calculadora de Dívida')
@Controller('calculators/debt')
export class DebtCalculatorController {
  constructor(private readonly debtCalculatorService: DebtCalculatorService) {}

  @Post('monthly-payment')
  @ApiOperation({ summary: 'Calcula o pagamento mensal fixo para quitar uma dívida' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pagamento mensal calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        monthlyPayment: {
          type: 'number',
          example: 332.14,
          description: 'Valor do pagamento mensal'
        }
      }
    }
  })
  calculateMonthlyPayment(@Body() dto: MonthlyPaymentDto): { monthlyPayment: number } {
    const monthlyPayment = this.debtCalculatorService.calculateMonthlyPayment(
      dto.totalDebt,
      dto.annualInterestRate,
      dto.months
    );
    return { monthlyPayment };
  }

  @Post('time-to-pay-off')
  @ApiOperation({ summary: 'Estima o tempo necessário para quitar uma dívida' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tempo para quitação calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        months: {
          type: 'number',
          example: 33.5,
          description: 'Número de meses para quitação'
        }
      }
    }
  })
  calculateTimeToPayOff(@Body() dto: TimeToPayOffDto): { months: number } {
    const months = this.debtCalculatorService.calculateTimeToPayOff(
      dto.totalDebt,
      dto.annualInterestRate,
      dto.monthlyPayment
    );
    return { months };
  }
}