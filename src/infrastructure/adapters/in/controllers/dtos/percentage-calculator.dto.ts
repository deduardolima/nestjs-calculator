import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PercentageChangeDto {
  @ApiProperty({
    description: 'Valor base para cálculo',
    example: 1000,
    type: Number,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Percentual a ser aplicado',
    example: 15,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  percentage: number;

  @ApiProperty({
    description: 'Indica se é um aumento (true) ou desconto (false)',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isIncrease: boolean;
}

export class PercentageOfDto {
  @ApiProperty({
    description: 'Valor parcial',
    example: 25,
    type: Number,
  })
  @IsNumber()
  part: number;

  @ApiProperty({
    description: 'Valor total',
    example: 100,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  whole: number;
}

export class PercentageDifferenceDto {
  @ApiProperty({
    description: 'Primeiro valor para comparação',
    example: 100,
    type: Number,
  })
  @IsNumber()
  value1: number;

  @ApiProperty({
    description: 'Segundo valor para comparação',
    example: 120,
    type: Number,
  })
  @IsNumber()
  value2: number;
}