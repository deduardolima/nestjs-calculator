import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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