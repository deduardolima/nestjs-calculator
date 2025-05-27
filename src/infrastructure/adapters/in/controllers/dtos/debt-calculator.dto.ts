import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MonthlyPaymentDto {
  @ApiProperty({
    description: 'Valor total da dívida',
    example: 10000,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  totalDebt: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 12.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  annualInterestRate: number;

  @ApiProperty({
    description: 'Número de meses para pagamento',
    example: 36,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  months: number;
}

export class TimeToPayOffDto {
  @ApiProperty({
    description: 'Valor total da dívida',
    example: 10000,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  totalDebt: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 12.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  annualInterestRate: number;

  @ApiProperty({
    description: 'Valor do pagamento mensal',
    example: 350,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  monthlyPayment: number;
}