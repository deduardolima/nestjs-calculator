import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CalculatePercentageDto {
  @ApiProperty({
    description: 'Valor base',
    example: 1000,
    type: Number,
  })
  @IsNumber({}, { message: 'Valor deve ser um número' })
  value: number;

  @ApiProperty({
    description: 'Percentual a ser calculado',
    example: 15,
    type: Number,
    minimum: 0,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Percentual deve ser um número' })
  @Min(0, { message: 'Percentual deve ser maior ou igual a zero' })
  @Max(1000, { message: 'Percentual deve ser menor ou igual a 1000%' })
  percentage: number;
}

export class PercentageOfDto {
  @ApiProperty({
    description: 'Parte do valor',
    example: 250,
    type: Number,
  })
  @IsNumber({}, { message: 'Parte deve ser um número' })
  part: number;

  @ApiProperty({
    description: 'Valor total',
    example: 1000,
    type: Number,
  })
  @IsNumber({}, { message: 'Total deve ser um número' })
  total: number;
}

export class PercentageChangeDto {
  @ApiProperty({
    description: 'Valor inicial',
    example: 100,
    type: Number,
  })
  @IsNumber({}, { message: 'Valor inicial deve ser um número' })
  oldValue: number;

  @ApiProperty({
    description: 'Valor final',
    example: 120,
    type: Number,
  })
  @IsNumber({}, { message: 'Valor final deve ser um número' })
  newValue: number;
}

export class ValueFromPercentageDto {
  @ApiProperty({
    description: 'Percentual conhecido',
    example: 25,
    type: Number,
    minimum: 0.01,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Percentual deve ser um número' })
  @Min(0.01, { message: 'Percentual deve ser maior que zero' })
  @Max(1000, { message: 'Percentual deve ser menor ou igual a 1000%' })
  percentage: number;

  @ApiProperty({
    description: 'Valor correspondente ao percentual',
    example: 50,
    type: Number,
  })
  @IsNumber({}, { message: 'Valor do percentual deve ser um número' })
  percentageValue: number;
}

export class DiscountDto {
  @ApiProperty({
    description: 'Preço original',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Preço original deve ser um número' })
  @Min(0, { message: 'Preço original deve ser maior ou igual a zero' })
  originalPrice: number;

  @ApiProperty({
    description: 'Percentual de desconto',
    example: 20,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Percentual de desconto deve ser um número' })
  @Min(0, { message: 'Percentual de desconto deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual de desconto deve ser menor ou igual a 100%' })
  discountPercentage: number;
}

export class MarkupDto {
  @ApiProperty({
    description: 'Preço original/custo',
    example: 80,
    type: Number,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Preço original deve ser um número' })
  @Min(0, { message: 'Preço original deve ser maior ou igual a zero' })
  originalPrice: number;

  @ApiProperty({
    description: 'Percentual de acréscimo/markup',
    example: 50,
    type: Number,
    minimum: 0,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Percentual de markup deve ser um número' })
  @Min(0, { message: 'Percentual de markup deve ser maior ou igual a zero' })
  @Max(1000, { message: 'Percentual de markup deve ser menor ou igual a 1000%' })
  markupPercentage: number;
}

export class ProfitMarginDto {
  @ApiProperty({
    description: 'Receita total',
    example: 1000,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Receita deve ser um número' })
  @Min(0.01, { message: 'Receita deve ser maior que zero' })
  revenue: number;

  @ApiProperty({
    description: 'Custo total',
    example: 600,
    type: Number,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Custo deve ser um número' })
  @Min(0, { message: 'Custo deve ser maior ou igual a zero' })
  cost: number;
}