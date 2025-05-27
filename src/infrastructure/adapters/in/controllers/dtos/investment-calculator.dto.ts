import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FutureValueDto {
  @ApiProperty({
    description: 'Valor inicial do investimento',
    example: 5000,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  initialInvestment: number;

  @ApiProperty({
    description: 'Valor do depósito mensal',
    example: 500,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  monthlyDeposit: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 8.5,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  annualInterestRate: number;

  @ApiProperty({
    description: 'Período do investimento em anos',
    example: 10,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  years: number;
}