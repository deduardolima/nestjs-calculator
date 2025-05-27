import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MonthlyPaymentDto {
  @ApiProperty({
    description: 'Valor total do empréstimo/financiamento',
    example: 50000,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  loanAmount: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 9.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  annualInterestRate: number;

  @ApiProperty({
    description: 'Prazo do empréstimo em meses',
    example: 48,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  months: number;
}

export class TotalPaymentDto {
  @ApiProperty({
    description: 'Valor da parcela mensal',
    example: 1250.75,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  monthlyPayment: number;

  @ApiProperty({
    description: 'Prazo do empréstimo em meses',
    example: 48,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  months: number;
}

export class TotalInterestDto {
  @ApiProperty({
    description: 'Valor total do empréstimo/financiamento',
    example: 50000,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  loanAmount: number;

  @ApiProperty({
    description: 'Valor total pago ao final do prazo',
    example: 60036,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  totalPayment: number;
}