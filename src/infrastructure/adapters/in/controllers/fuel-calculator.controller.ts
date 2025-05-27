import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FuelCalculatorService } from '../../../../application/services/fuel-calculator.service';
import { AverageConsumptionDto, TotalCostDto } from './dtos/fuel-calculator.dto';

@ApiTags('Calculadora de Combustível')
@Controller('calculators/fuel')
export class FuelCalculatorController {
  constructor(private readonly fuelCalculatorService: FuelCalculatorService) {}

  @Post('average-consumption')
  @ApiOperation({ summary: 'Calcula o consumo médio de combustível' })
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
        }
      }
    }
  })
  calculateAverageConsumption(@Body() dto: AverageConsumptionDto): { consumption: number } {
    const consumption = this.fuelCalculatorService.calculateAverageConsumption(
      dto.distance,
      dto.fuelUsed,
      dto.isKmPerLiter
    );
    return { consumption };
  }

  @Post('total-cost')
  @ApiOperation({ summary: 'Calcula o custo total da viagem' })
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
        }
      }
    }
  })
  calculateTotalCost(@Body() dto: TotalCostDto): { totalCost: number } {
    const totalCost = this.fuelCalculatorService.calculateTotalCost(
      dto.distance,
      dto.consumption,
      dto.fuelPrice,
      dto.isKmPerLiter
    );
    return { totalCost };
  }
}