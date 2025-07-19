import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DebtCalculatorService } from '~/application/services';
import { MonthlyPaymentDto, TimeToPayOffDto } from './dtos';


@ApiTags('Calculadora de Dívida')
@Controller('calculators/debt')
export class DebtCalculatorController {
  constructor(private readonly debtCalculatorService: DebtCalculatorService) { }

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
        },
        calculationTime: {
          type: 'string',
          example: '2ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            totalDebt: { type: 'number', example: 10000 },
            annualInterestRate: { type: 'number', example: 12 },
            months: { type: 'number', example: 24 },
            totalPaid: { type: 'number', example: 7971.36 },
            totalInterest: { type: 'number', example: -2028.64 }
          }
        }
      }
    }
  })
  async calculateMonthlyPayment(@Body() dto: MonthlyPaymentDto): Promise<{
    monthlyPayment: number;
    calculationTime: string;
    metadata: {
      totalDebt: number;
      annualInterestRate: number;
      months: number;
      totalPaid: number;
      totalInterest: number;
    };
  }> {
    const startTime = Date.now();

    const monthlyPayment = await this.debtCalculatorService.calculateMonthlyPayment(
      dto.totalDebt,
      dto.annualInterestRate,
      dto.months
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalPaid = monthlyPayment * dto.months;
    const totalInterest = totalPaid - dto.totalDebt;

    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      calculationTime,
      metadata: {
        totalDebt: dto.totalDebt,
        annualInterestRate: dto.annualInterestRate,
        months: dto.months,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2))
      }
    };
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
        },
        years: {
          type: 'number',
          example: 2.79,
          description: 'Número de anos para quitação'
        },
        calculationTime: {
          type: 'string',
          example: '3ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            totalDebt: { type: 'number', example: 10000 },
            monthlyPayment: { type: 'number', example: 300 },
            totalPaid: { type: 'number', example: 10050 },
            totalInterest: { type: 'number', example: 50 }
          }
        }
      }
    }
  })
  async calculateTimeToPayOff(@Body() dto: TimeToPayOffDto): Promise<{
    months: number;
    years: number;
    calculationTime: string;
    metadata: {
      totalDebt: number;
      monthlyPayment: number;
      totalPaid: number;
      totalInterest: number;
    };
  }> {
    const startTime = Date.now();

    const months = await this.debtCalculatorService.calculateTimeToPayOff(
      dto.totalDebt,
      dto.annualInterestRate,
      dto.monthlyPayment
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalPaid = dto.monthlyPayment * months;
    const totalInterest = totalPaid - dto.totalDebt;

    return {
      months: Number(months.toFixed(1)),
      years: Number((months / 12).toFixed(2)),
      calculationTime,
      metadata: {
        totalDebt: dto.totalDebt,
        monthlyPayment: dto.monthlyPayment,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2))
      }
    };
  }

}