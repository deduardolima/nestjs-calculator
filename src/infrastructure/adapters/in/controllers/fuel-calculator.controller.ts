import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FuelCalculatorService } from '../../../../application/services';
import { AverageConsumptionDto, DriverProjectionDto, EarningsProjectionDto, TotalCostDto } from './dtos';


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

  @Post('driver-projection')
  @ApiOperation({ summary: 'Calcula projeção de ganhos para motoristas de aplicativo (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Projeção calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        projection: {
          type: 'object',
          properties: {
            totalKmPerMonth: {
              type: 'number',
              example: 7273,
              description: 'Total de quilômetros necessários por mês'
            },
            kmPerDay: {
              type: 'number',
              example: 340,
              description: 'Quilômetros necessários por dia trabalhado'
            },
            workingDaysPerMonth: {
              type: 'number',
              example: 21.4,
              description: 'Dias úteis por mês'
            },
            grossEarnings: {
              type: 'number',
              example: 10909.50,
              description: 'Ganho bruto mensal'
            },
            totalFuelCost: {
              type: 'number',
              example: 2909.20,
              description: 'Gasto total com combustível por mês'
            },
            netEarnings: {
              type: 'number',
              example: 8000.00,
              description: 'Ganho líquido mensal (meta)'
            },
            costPerKm: {
              type: 'number',
              example: 0.40,
              description: 'Custo de combustível por quilômetro'
            },
            netEarningsPerKm: {
              type: 'number',
              example: 1.10,
              description: 'Ganho líquido por quilômetro'
            },
            fuelLitersPerDay: {
              type: 'number',
              example: 34.0,
              description: 'Litros de combustível necessários por dia'
            },
            fuelCostPerDay: {
              type: 'number',
              example: 136.00,
              description: 'Gasto com combustível por dia'
            }
          }
        },
        calculationTime: {
          type: 'string',
          example: '2ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            earningsPerKm: { type: 'number', example: 1.50 },
            monthlyTarget: { type: 'number', example: 8000 },
            fuelPrice: { type: 'number', example: 4.00 },
            fuelEfficiency: { type: 'number', example: 10 },
            workingDaysPerWeek: { type: 'number', example: 6 }
          }
        }
      }
    }
  })
  async calculateDriverProjection(@Body() dto: DriverProjectionDto): Promise<{
    projection: {
      totalKmPerMonth: number;
      kmPerDay: number;
      workingDaysPerMonth: number;
      grossEarnings: number;
      totalFuelCost: number;
      netEarnings: number;
      costPerKm: number;
      netEarningsPerKm: number;
      fuelLitersPerDay: number;
      fuelCostPerDay: number;
    };
    calculationTime: string;
    metadata: {
      earningsPerKm: number;
      monthlyTarget: number;
      fuelPrice: number;
      fuelEfficiency: number;
      workingDaysPerWeek: number;
    };
  }> {
    const startTime = Date.now();

    const projection = await this.fuelCalculatorService.calculateDriverProjection(
      dto.earningsPerKm,
      dto.monthlyTarget,
      dto.fuelPrice,
      dto.fuelEfficiency,
      dto.workingDaysPerWeek
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      projection: {
        totalKmPerMonth: Math.round(projection.totalKmPerMonth),
        kmPerDay: Math.round(projection.kmPerDay),
        workingDaysPerMonth: Number(projection.workingDaysPerMonth.toFixed(1)),
        grossEarnings: Number(projection.grossEarnings.toFixed(2)),
        totalFuelCost: Number(projection.totalFuelCost.toFixed(2)),
        netEarnings: Number(projection.netEarnings.toFixed(2)),
        costPerKm: Number(projection.costPerKm.toFixed(3)),
        netEarningsPerKm: Number(projection.netEarningsPerKm.toFixed(3)),
        // ❌ REMOVIDO: hoursPerDay: Number(projection.hoursPerDay.toFixed(1)),
        fuelLitersPerDay: Number(projection.fuelLitersPerDay.toFixed(1)),
        fuelCostPerDay: Number(projection.fuelCostPerDay.toFixed(2))
      },
      calculationTime,
      metadata: {
        earningsPerKm: dto.earningsPerKm,
        monthlyTarget: dto.monthlyTarget,
        fuelPrice: dto.fuelPrice,
        fuelEfficiency: dto.fuelEfficiency,
        workingDaysPerWeek: dto.workingDaysPerWeek
      }
    };
  }

  @Post('earnings-projection')
  @ApiOperation({ summary: 'Calcula ganhos mensais baseado em KM rodados por dia (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Projeção de ganhos calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        projection: {
          type: 'object',
          properties: {
            monthlyGrossEarnings: {
              type: 'number',
              example: 9000.00,
              description: 'Ganho bruto mensal'
            },
            monthlyFuelCost: {
              type: 'number',
              example: 2400.00,
              description: 'Gasto total com combustível por mês'
            },
            monthlyAdditionalCosts: {
              type: 'number',
              example: 500.00,
              description: 'Custos adicionais mensais'
            },
            monthlyNetEarnings: {
              type: 'number',
              example: 6100.00,
              description: 'Ganho líquido mensal'
            },
            totalKmPerMonth: {
              type: 'number',
              example: 6000,
              description: 'Total de quilômetros por mês'
            },
            workingDaysPerMonth: {
              type: 'number',
              example: 20.0,
              description: 'Dias úteis por mês'
            },
            hoursPerDay: {
              type: 'number',
              example: 10.0,
              description: 'Horas estimadas de trabalho por dia'
            },
            costPerKm: {
              type: 'number',
              example: 0.40,
              description: 'Custo de combustível por quilômetro'
            },
            netEarningsPerKm: {
              type: 'number',
              example: 1.10,
              description: 'Ganho líquido por quilômetro'
            },
            profitMargin: {
              type: 'number',
              example: 67.8,
              description: 'Margem de lucro em percentual'
            },
            viabilityStatus: {
              type: 'string',
              example: 'VIÁVEL',
              description: 'Status de viabilidade (VIÁVEL, ATENÇÃO, RISCO, INVIÁVEL)'
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              example: ['💡 Considere negociar melhor valor por KM'],
              description: 'Recomendações para melhorar os ganhos'
            },
            dailyMetrics: {
              type: 'object',
              properties: {
                dailyGrossEarnings: { type: 'number', example: 450.00 },
                dailyFuelCost: { type: 'number', example: 120.00 },
                dailyNetEarnings: { type: 'number', example: 305.00 },
                fuelLitersPerDay: { type: 'number', example: 30.0 }
              }
            }
          }
        },
        calculationTime: {
          type: 'string',
          example: '3ms',
          description: 'Tempo de processamento'
        },
        metadata: {
          type: 'object',
          properties: {
            earningsPerKm: { type: 'number', example: 1.50 },
            kmPerDay: { type: 'number', example: 300 },
            fuelPrice: { type: 'number', example: 4.00 },
            fuelEfficiency: { type: 'number', example: 10 },
            workingDaysPerWeek: { type: 'number', example: 6 },
            additionalCosts: { type: 'number', example: 500 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['KM por dia muito alto para ser realista']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async calculateEarningsProjection(@Body() dto: EarningsProjectionDto): Promise<{
    projection: {
      monthlyGrossEarnings: number;
      monthlyFuelCost: number;
      monthlyAdditionalCosts: number;
      monthlyNetEarnings: number;
      totalKmPerMonth: number;
      workingDaysPerMonth: number;
      costPerKm: number;
      netEarningsPerKm: number;
      profitMargin: number;
      viabilityStatus: string;
      recommendations: string[];
      dailyMetrics: {
        dailyGrossEarnings: number;
        dailyFuelCost: number;
        dailyNetEarnings: number;
        fuelLitersPerDay: number;
      };
    };
    calculationTime: string;
    metadata: {
      earningsPerKm: number;
      kmPerDay: number;
      fuelPrice: number;
      fuelEfficiency: number;
      workingDaysPerWeek: number;
      additionalCosts: number;
    };
  }> {
    const startTime = Date.now();

    const projection = await this.fuelCalculatorService.calculateEarningsProjection(
      dto.earningsPerKm,
      dto.kmPerDay,
      dto.fuelPrice,
      dto.fuelEfficiency,
      dto.workingDaysPerWeek,
      dto.additionalCosts || 0
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      projection: {
        monthlyGrossEarnings: Number(projection.monthlyGrossEarnings.toFixed(2)),
        monthlyFuelCost: Number(projection.monthlyFuelCost.toFixed(2)),
        monthlyAdditionalCosts: Number(projection.monthlyAdditionalCosts.toFixed(2)),
        monthlyNetEarnings: Number(projection.monthlyNetEarnings.toFixed(2)),
        totalKmPerMonth: Math.round(projection.totalKmPerMonth),
        workingDaysPerMonth: Number(projection.workingDaysPerMonth.toFixed(1)),
        costPerKm: Number(projection.costPerKm.toFixed(3)),
        netEarningsPerKm: Number(projection.netEarningsPerKm.toFixed(3)),
        profitMargin: Number(projection.profitMargin.toFixed(1)),
        viabilityStatus: projection.viabilityStatus,
        recommendations: projection.recommendations,
        dailyMetrics: {
          dailyGrossEarnings: Number(projection.dailyMetrics.dailyGrossEarnings.toFixed(2)),
          dailyFuelCost: Number(projection.dailyMetrics.dailyFuelCost.toFixed(2)),
          dailyNetEarnings: Number(projection.dailyMetrics.dailyNetEarnings.toFixed(2)),
          fuelLitersPerDay: Number(projection.dailyMetrics.fuelLitersPerDay.toFixed(1))
        }
      },
      calculationTime,
      metadata: {
        earningsPerKm: dto.earningsPerKm,
        kmPerDay: dto.kmPerDay,
        fuelPrice: dto.fuelPrice,
        fuelEfficiency: dto.fuelEfficiency,
        workingDaysPerWeek: dto.workingDaysPerWeek,
        additionalCosts: dto.additionalCosts || 0
      }
    };
  }

}