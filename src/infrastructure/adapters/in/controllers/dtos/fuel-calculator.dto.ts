import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class AverageConsumptionDto {
  @ApiProperty({
    description: 'Distância percorrida em quilômetros',
    example: 350,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  distance: number;

  @ApiProperty({
    description: 'Quantidade de combustível utilizado em litros',
    example: 30,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  fuelUsed: number;

  @ApiProperty({
    description: 'Indica se o cálculo deve ser feito em km/l (true) ou l/100km (false)',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isKmPerLiter: boolean;
}

export class TotalCostDto {
  @ApiProperty({
    description: 'Distância total da viagem em quilômetros',
    example: 500,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  distance: number;

  @ApiProperty({
    description: 'Consumo médio do veículo (km/l ou l/100km)',
    example: 12,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  consumption: number;

  @ApiProperty({
    description: 'Preço do combustível por litro',
    example: 5.79,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  fuelPrice: number;

  @ApiProperty({
    description: 'Indica se o consumo está em km/l (true) ou l/100km (false)',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isKmPerLiter: boolean;
}


export class DriverProjectionDto {
  @ApiProperty({
    description: 'Ganho por quilômetro em reais',
    example: 1.50,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Ganho por KM deve ser um número' })
  @IsPositive({ message: 'Ganho por KM deve ser positivo' })
  earningsPerKm: number;

  @ApiProperty({
    description: 'Meta mensal líquida em reais',
    example: 8000,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Meta mensal deve ser um número' })
  @IsPositive({ message: 'Meta mensal deve ser positiva' })
  monthlyTarget: number;

  @ApiProperty({
    description: 'Preço do combustível por litro',
    example: 4.00,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Preço do combustível deve ser um número' })
  @IsPositive({ message: 'Preço do combustível deve ser positivo' })
  fuelPrice: number;

  @ApiProperty({
    description: 'Autonomia do veículo (km por litro)',
    example: 10,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Autonomia deve ser um número' })
  @Min(1, { message: 'Autonomia deve ser pelo menos 1 km/l' })
  fuelEfficiency: number;

  @ApiProperty({
    description: 'Dias de trabalho por semana',
    example: 6,
    type: Number,
    minimum: 1,
    maximum: 7,
  })
  @IsNumber({}, { message: 'Dias de trabalho deve ser um número' })
  @Min(1, { message: 'Deve trabalhar pelo menos 1 dia por semana' })
  @Max(7, { message: 'Não pode trabalhar mais de 7 dias por semana' })
  workingDaysPerWeek: number;
}

export class EarningsProjectionDto {
  @ApiProperty({
    description: 'Ganho por quilômetro em reais',
    example: 1.50,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Ganho por KM deve ser um número' })
  @IsPositive({ message: 'Ganho por KM deve ser positivo' })
  earningsPerKm: number;

  @ApiProperty({
    description: 'Quilômetros rodados por dia',
    example: 300,
    type: Number,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'KM por dia deve ser um número' })
  @Min(1, { message: 'Deve rodar pelo menos 1 km por dia' })
  @Max(1000, { message: 'KM por dia não pode exceder 1000km (irreal)' })
  kmPerDay: number;

  @ApiProperty({
    description: 'Preço do combustível por litro',
    example: 4.00,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Preço do combustível deve ser um número' })
  @IsPositive({ message: 'Preço do combustível deve ser positivo' })
  fuelPrice: number;

  @ApiProperty({
    description: 'Autonomia do veículo (km por litro)',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Autonomia deve ser um número' })
  @Min(1, { message: 'Autonomia deve ser pelo menos 1 km/l' })
  @Max(50, { message: 'Autonomia não pode exceder 50 km/l' })
  fuelEfficiency: number;

  @ApiProperty({
    description: 'Dias de trabalho por semana',
    example: 6,
    type: Number,
    minimum: 1,
    maximum: 7,
  })
  @IsNumber({}, { message: 'Dias de trabalho deve ser um número' })
  @Min(1, { message: 'Deve trabalhar pelo menos 1 dia por semana' })
  @Max(7, { message: 'Não pode trabalhar mais de 7 dias por semana' })
  workingDaysPerWeek: number;

  @ApiProperty({
    description: 'Custos adicionais mensais (manutenção, seguro, etc.)',
    example: 500,
    type: Number,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Custos adicionais devem ser um número' })
  @Min(0, { message: 'Custos adicionais não podem ser negativos' })
  additionalCosts?: number;
}