import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoanCalculatorService } from '~/application/services';
import { AmortizationDto, LoanCapacityDto, MonthlyPaymentDto, TotalInterestDto } from './dtos/loan-calculator.dto';



interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

@ApiTags('Calculadora de Empréstimo/Financiamento')
@Controller('calculators/loan')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LoanCalculatorController {
  constructor(private readonly loanCalculatorService: LoanCalculatorService) { }

  @Post('monthly-payment')
  @ApiOperation({ summary: 'Calcula o valor da parcela mensal de um empréstimo/financiamento (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Parcela mensal calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        monthlyPayment: {
          type: 'number',
          example: 1250.75,
          description: 'Valor da parcela mensal'
        },
        totalPayments: {
          type: 'number',
          example: 360,
          description: 'Número total de parcelas'
        },
        totalAmount: {
          type: 'number',
          example: 450270,
          description: 'Valor total a ser pago'
        },
        calculationTime: {
          type: 'string',
          example: '1ms',
          description: 'Tempo de processamento'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Valor do empréstimo deve ser positivo']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async calculateMonthlyPayment(@Body() dto: MonthlyPaymentDto): Promise<{
    monthlyPayment: number;
    totalPayments: number;
    totalAmount: number;
    calculationTime: string;
    metadata: {
      loanAmount: number;
      annualInterestRate: number;
      loanTermInYears: number;
      monthlyInterestRate: number;
    };
  }> {
    const startTime = Date.now();

    const monthlyPayment = await this.loanCalculatorService.calculateMonthlyPayment(
      dto.loanAmount,
      dto.annualInterestRate,
      dto.loanTermInYears
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalPayments = dto.loanTermInYears * 12;
    const totalAmount = monthlyPayment * totalPayments;
    const monthlyInterestRate = dto.annualInterestRate / 100 / 12;

    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayments,
      totalAmount: Number(totalAmount.toFixed(2)),
      calculationTime,
      metadata: {
        loanAmount: dto.loanAmount,
        annualInterestRate: dto.annualInterestRate,
        loanTermInYears: dto.loanTermInYears,
        monthlyInterestRate: Number(monthlyInterestRate.toFixed(6))
      }
    };
  }

  @Post('total-interest')
  @ApiOperation({ summary: 'Calcula o total de juros pagos no empréstimo/financiamento (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Total de juros calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalInterest: {
          type: 'number',
          example: 150270,
          description: 'Total de juros pagos'
        },
        totalPaid: {
          type: 'number',
          example: 450270,
          description: 'Valor total pago'
        },
        interestPercentage: {
          type: 'number',
          example: 50.09,
          description: 'Percentual de juros sobre o valor emprestado'
        },
        calculationTime: {
          type: 'string',
          example: '0ms',
          description: 'Tempo de processamento'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateTotalInterest(@Body() dto: TotalInterestDto): Promise<{
    totalInterest: number;
    totalPaid: number;
    interestPercentage: number;
    calculationTime: string;
    metadata: {
      loanAmount: number;
      annualInterestRate: number;
      loanTermInYears: number;
    };
  }> {
    const startTime = Date.now();

    const totalInterest = await this.loanCalculatorService.calculateTotalInterest(
      dto.loanAmount,
      dto.annualInterestRate,
      dto.loanTermInYears
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalPaid = dto.loanAmount + totalInterest;
    const interestPercentage = (totalInterest / dto.loanAmount) * 100;

    return {
      totalInterest: Number(totalInterest.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      interestPercentage: Number(interestPercentage.toFixed(2)),
      calculationTime,
      metadata: {
        loanAmount: dto.loanAmount,
        annualInterestRate: dto.annualInterestRate,
        loanTermInYears: dto.loanTermInYears
      }
    };
  }

  @Post('amortization-schedule')
  @ApiOperation({ summary: 'Gera tabela de amortização completa do empréstimo (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Tabela de amortização gerada com sucesso',
    schema: {
      type: 'object',
      properties: {
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'number', example: 1 },
              payment: { type: 'number', example: 1250.75 },
              principal: { type: 'number', example: 583.42 },
              interest: { type: 'number', example: 667.33 },
              balance: { type: 'number', example: 199416.58 }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalPayments: { type: 'number', example: 360 },
            totalPaid: { type: 'number', example: 450270 },
            totalInterest: { type: 'number', example: 150270 },
            monthlyPayment: { type: 'number', example: 1250.75 }
          }
        },
        calculationTime: { type: 'string', example: '2ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateAmortizationSchedule(@Body() dto: AmortizationDto): Promise<{
    schedule: AmortizationEntry[];
    summary: {
      totalPayments: number;
      totalPaid: number;
      totalInterest: number;
      monthlyPayment: number;
    };
    calculationTime: string;
    metadata: {
      loanAmount: number;
      annualInterestRate: number;
      loanTermInYears: number;
    };
  }> {
    const startTime = Date.now();

    const schedule = await this.loanCalculatorService.calculateAmortizationSchedule(
      dto.loanAmount,
      dto.annualInterestRate,
      dto.loanTermInYears
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalPayments = schedule.length;
    const monthlyPayment = schedule[0]?.payment || 0;
    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - dto.loanAmount;

    return {
      schedule,
      summary: {
        totalPayments,
        totalPaid: Number(totalPaid.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2)),
        monthlyPayment: Number(monthlyPayment.toFixed(2))
      },
      calculationTime,
      metadata: {
        loanAmount: dto.loanAmount,
        annualInterestRate: dto.annualInterestRate,
        loanTermInYears: dto.loanTermInYears
      }
    };
  }

  @Post('loan-capacity')
  @ApiOperation({ summary: 'Calcula a capacidade máxima de empréstimo baseada na renda (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Capacidade de empréstimo calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        maxLoanAmount: {
          type: 'number',
          example: 180000,
          description: 'Valor máximo do empréstimo'
        },
        maxMonthlyPayment: {
          type: 'number',
          example: 1200,
          description: 'Valor máximo da parcela mensal'
        },
        availableIncome: {
          type: 'number',
          example: 5000,
          description: 'Renda disponível após gastos'
        },
        debtToIncomeRatio: {
          type: 'number',
          example: 28,
          description: 'Percentual da renda comprometida'
        },
        calculationTime: { type: 'string', example: '1ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateLoanCapacity(@Body() dto: LoanCapacityDto): Promise<{
    maxLoanAmount: number;
    maxMonthlyPayment: number;
    availableIncome: number;
    debtToIncomeRatio: number;
    calculationTime: string;
    metadata: {
      monthlyIncome: number;
      monthlyExpenses: number;
      annualInterestRate: number;
      loanTermInYears: number;
      debtToIncomeRatioUsed: number;
    };
  }> {
    const startTime = Date.now();

    const result = await this.loanCalculatorService.calculateLoanCapacity(
      dto.monthlyIncome,
      dto.monthlyExpenses,
      dto.annualInterestRate,
      dto.loanTermInYears,
      dto.debtToIncomeRatio || 0.28
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const availableIncome = dto.monthlyIncome - dto.monthlyExpenses;
    const debtToIncomeRatioUsed = dto.debtToIncomeRatio || 0.28;

    return {
      maxLoanAmount: result.maxLoanAmount,
      maxMonthlyPayment: result.maxMonthlyPayment,
      availableIncome: Number(availableIncome.toFixed(2)),
      debtToIncomeRatio: Number((debtToIncomeRatioUsed * 100).toFixed(1)),
      calculationTime,
      metadata: {
        monthlyIncome: dto.monthlyIncome,
        monthlyExpenses: dto.monthlyExpenses,
        annualInterestRate: dto.annualInterestRate,
        loanTermInYears: dto.loanTermInYears,
        debtToIncomeRatioUsed
      }
    };
  }


}