import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FuelCalculatorService } from '../../../../application/services';
import { AverageConsumptionDto, TotalCostDto } from './dtos';


@ApiTags('Calculadora de Combustível')
@Controller('calculators/fuel')
export class FuelCalculatorController {
  constructor(private readonly fuelCalculatorService: FuelCalculatorService) { }

  @Post('average-consumption')
  @ApiOperation({ summary: 'Calcula o consumo médio de combustível (com cache)' })
  @ApiResponse({
    status: 200,
    description: 'Consumo médio calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        consumption: {
          type: 'number',
          example: 11.67,
          description: 'Consumo médio (km/l ou l/100km)'
        },
        unit: {
          type: 'string',
          example: 'km/l',
          description: 'Unidade de medida'
        },
        calculationTime: {
          type: 'string',
          example: '1ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            distance: { type: 'number', example: 350 },
            fuelUsed: { type: 'number', example: 30 },
            isKmPerLiter: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  async calculateAverageConsumption(@Body() dto: AverageConsumptionDto): Promise<{
    consumption: number;
    unit: string;
    calculationTime: string;
    metadata: {
      distance: number;
      fuelUsed: number;
      isKmPerLiter: boolean;
    };
  }> {
    const startTime = Date.now();

    const consumption = await this.fuelCalculatorService.calculateAverageConsumption(
      dto.distance,
      dto.fuelUsed,
      dto.isKmPerLiter
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      consumption: Number(consumption.toFixed(2)),
      unit: dto.isKmPerLiter ? 'km/l' : 'l/100km',
      calculationTime,
      metadata: {
        distance: dto.distance,
        fuelUsed: dto.fuelUsed,
        isKmPerLiter: dto.isKmPerLiter
      }
    };
  }

  @Post('total-cost')
  @ApiOperation({ summary: 'Calcula o custo total da viagem (com cache)' })
  @ApiResponse({
    status: 200,
    description: 'Custo total calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalCost: {
          type: 'number',
          example: 241.25,
          description: 'Custo total da viagem'
        },
        fuelNeeded: {
          type: 'number',
          example: 35.5,
          description: 'Quantidade de combustível necessária'
        },
        calculationTime: {
          type: 'string',
          example: '1ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            distance: { type: 'number', example: 400 },
            consumption: { type: 'number', example: 12 },
            fuelPrice: { type: 'number', example: 6.8 },
            isKmPerLiter: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  async calculateTotalCost(@Body() dto: TotalCostDto): Promise<{
    totalCost: number;
    fuelNeeded: number;
    calculationTime: string;
    metadata: {
      distance: number;
      consumption: number;
      fuelPrice: number;
      isKmPerLiter: boolean;
    };
  }> {
    const startTime = Date.now();

    const totalCost = await this.fuelCalculatorService.calculateTotalCost(
      dto.distance,
      dto.consumption,
      dto.fuelPrice,
      dto.isKmPerLiter
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    let fuelNeeded: number;
    if (dto.isKmPerLiter) {
      fuelNeeded = dto.distance / dto.consumption;
    } else {
      fuelNeeded = (dto.consumption * dto.distance) / 100;
    }

    return {
      totalCost: Number(totalCost.toFixed(2)),
      fuelNeeded: Number(fuelNeeded.toFixed(2)),
      calculationTime,
      metadata: {
        distance: dto.distance,
        consumption: dto.consumption,
        fuelPrice: dto.fuelPrice,
        isKmPerLiter: dto.isKmPerLiter
      }
    };
  }


}