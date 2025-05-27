import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoanCalculatorService } from '../../../../application/services/loan-calculator.service';
import { 
  MonthlyPaymentDto, 
  TotalPaymentDto, 
  TotalInterestDto 
} from './dtos/loan-calculator.dto';

@ApiTags('Calculadora de Empréstimo/Financiamento')
@Controller('calculators/loan')
export class LoanCalculatorController {
  constructor(private readonly loanCalculatorService: LoanCalculatorService) {}

  @Post('monthly-payment')
  @ApiOperation({ summary: 'Calcula o valor da parcela mensal de um empréstimo/financiamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Parcela mensal calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        monthlyPayment: {
          type: 'number',
          example: 1250.75,
          description: 'Valor da parcela mensal'
        }
      }
    }
  })
  calculateMonthlyPayment(@Body() dto: MonthlyPaymentDto): { monthlyPayment: number } {
    const monthlyPayment = this.loanCalculatorService.calculateMonthlyPayment(
      dto.loanAmount,
      dto.annualInterestRate,
      dto.months
    );
    return { monthlyPayment };
  }

  @Post('total-payment')
  @ApiOperation({ summary: 'Calcula o valor total pago ao final do empréstimo/financiamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Valor total calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalPayment: {
          type: 'number',
          example: 60036,
          description: 'Valor total pago'
        }
      }
    }
  })
  calculateTotalPayment(@Body() dto: TotalPaymentDto): { totalPayment: number } {
    const totalPayment = this.loanCalculatorService.calculateTotalPayment(
      dto.monthlyPayment,
      dto.months
    );
    return { totalPayment };
  }

  @Post('total-interest')
  @ApiOperation({ summary: 'Calcula o total de juros pagos no empréstimo/financiamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Total de juros calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalInterest: {
          type: 'number',
          example: 10036,
          description: 'Total de juros pagos'
        }
      }
    }
  })
  calculateTotalInterest(@Body() dto: TotalInterestDto): { totalInterest: number } {
    const totalInterest = this.loanCalculatorService.calculateTotalInterest(
      dto.loanAmount,
      dto.totalPayment
    );
    return { totalInterest };
  }
}