import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class FutureValueDto {
  @ApiProperty({
    description: 'Valor inicial do investimento',
    example: 10000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Valor inicial deve ser um número' })
  @IsPositive({ message: 'Valor inicial deve ser positivo' })
  initialInvestment: number;

  @ApiProperty({
    description: 'Valor do depósito mensal',
    example: 500,
    type: Number,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Depósito mensal deve ser um número' })
  @Min(0, { message: 'Depósito mensal deve ser maior ou igual a zero' })
  monthlyDeposit: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 12,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  @Max(100, { message: 'Taxa de juros deve ser menor ou igual a 100%' })
  annualInterestRate: number;

  @ApiProperty({
    description: 'Período do investimento em anos',
    example: 5,
    type: Number,
    minimum: 0.1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Período deve ser um número' })
  @Min(0.1, { message: 'Período deve ser de pelo menos 0.1 anos (1.2 meses)' })
  @Max(100, { message: 'Período deve ser menor ou igual a 100 anos' })
  years: number;
}

export class CompoundInterestDto {
  @ApiProperty({
    description: 'Valor principal (capital inicial)',
    example: 50000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Valor principal deve ser um número' })
  @IsPositive({ message: 'Valor principal deve ser positivo' })
  principal: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 10,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  @Max(100, { message: 'Taxa de juros deve ser menor ou igual a 100%' })
  rate: number;

  @ApiProperty({
    description: 'Período em anos',
    example: 3,
    type: Number,
    minimum: 0.1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Período deve ser um número' })
  @Min(0.1, { message: 'Período deve ser de pelo menos 0.1 anos' })
  @Max(100, { message: 'Período deve ser menor ou igual a 100 anos' })
  time: number;

  @ApiProperty({
    description: 'Frequência de capitalização por ano (padrão: 12 - mensal)',
    example: 12,
    type: Number,
    minimum: 1,
    maximum: 365,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Frequência deve ser um número' })
  @Min(1, { message: 'Frequência deve ser pelo menos 1 (anual)' })
  @Max(365, { message: 'Frequência deve ser no máximo 365 (diária)' })
  frequency?: number;
}

export class ROIDto {
  @ApiProperty({
    description: 'Investimento inicial',
    example: 100000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Investimento inicial deve ser um número' })
  @IsPositive({ message: 'Investimento inicial deve ser positivo' })
  initialInvestment: number;

  @ApiProperty({
    description: 'Valor final do investimento',
    example: 150000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Valor final deve ser um número' })
  @IsPositive({ message: 'Valor final deve ser positivo' })
  finalValue: number;
}

export class SimpleInterestDto {
  @ApiProperty({
    description: 'Valor principal (capital inicial)',
    example: 25000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Valor principal deve ser um número' })
  @IsPositive({ message: 'Valor principal deve ser positivo' })
  principal: number;

  @ApiProperty({
    description: 'Taxa de juros anual em porcentagem',
    example: 8,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  @Max(100, { message: 'Taxa de juros deve ser menor ou igual a 100%' })
  rate: number;

  @ApiProperty({
    description: 'Período em anos',
    example: 2,
    type: Number,
    minimum: 0.1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Período deve ser um número' })
  @Min(0.1, { message: 'Período deve ser de pelo menos 0.1 anos' })
  @Max(100, { message: 'Período deve ser menor ou igual a 100 anos' })
  time: number;
}