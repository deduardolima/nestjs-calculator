import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

import { IsOptional, Max, Min } from 'class-validator';

export class MonthlyPaymentDto {
  @ApiProperty({
    description: 'Valor do empréstimo',
    example: 200000,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Valor do empréstimo deve ser um número' })
  @IsPositive({ message: 'Valor do empréstimo deve ser positivo' })
  loanAmount: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 8.5,
    type: Number,
    minimum: 0,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  @Max(50, { message: 'Taxa de juros deve ser menor ou igual a 50%' })
  annualInterestRate: number;

  @ApiProperty({
    description: 'Prazo do empréstimo em anos',
    example: 30,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Prazo deve ser um número' })
  @Min(1, { message: 'Prazo deve ser de pelo menos 1 ano' })
  @Max(50, { message: 'Prazo deve ser menor ou igual a 50 anos' })
  loanTermInYears: number;
}

export class TotalInterestDto extends MonthlyPaymentDto { }

export class AmortizationDto extends MonthlyPaymentDto { }

export class LoanCapacityDto {
  @ApiProperty({
    description: 'Renda mensal bruta',
    example: 8000,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Renda mensal deve ser um número' })
  @IsPositive({ message: 'Renda mensal deve ser positiva' })
  monthlyIncome: number;

  @ApiProperty({
    description: 'Gastos mensais fixos',
    example: 3000,
    type: Number,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Gastos mensais devem ser um número' })
  @Min(0, { message: 'Gastos mensais devem ser maior ou igual a zero' })
  monthlyExpenses: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 8.5,
    type: Number,
    minimum: 0,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  @Max(50, { message: 'Taxa de juros deve ser menor ou igual a 50%' })
  annualInterestRate: number;

  @ApiProperty({
    description: 'Prazo do empréstimo em anos',
    example: 30,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Prazo deve ser um número' })
  @Min(1, { message: 'Prazo deve ser de pelo menos 1 ano' })
  @Max(50, { message: 'Prazo deve ser menor ou igual a 50 anos' })
  loanTermInYears: number;

  @ApiProperty({
    description: 'Relação dívida/renda máxima (padrão: 0.28 = 28%)',
    example: 0.28,
    type: Number,
    minimum: 0.1,
    maximum: 0.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Relação dívida/renda deve ser um número' })
  @Min(0.1, { message: 'Relação dívida/renda deve ser pelo menos 10%' })
  @Max(0.5, { message: 'Relação dívida/renda deve ser no máximo 50%' })
  debtToIncomeRatio?: number;
}