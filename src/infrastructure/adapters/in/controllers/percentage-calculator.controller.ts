import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PercentageCalculatorService } from '../../../../application/services';


import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CalculatePercentageDto, DiscountDto, MarkupDto, PercentageChangeDto, PercentageOfDto, ProfitMarginDto, ValueFromPercentageDto } from './dtos';


@ApiTags('Calculadora de Porcentagem')
@Controller('calculators/percentage')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PercentageCalculatorController {
  constructor(private readonly percentageCalculatorService: PercentageCalculatorService) { }

  @Post('calculate')
  @ApiOperation({ summary: 'Calcula X% de um valor (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Percentual calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        result: {
          type: 'number',
          example: 150,
          description: 'Resultado do cálculo percentual'
        },
        calculation: {
          type: 'string',
          example: '15% de 1000 = 150',
          description: 'Descrição do cálculo realizado'
        },
        calculationTime: {
          type: 'string',
          example: '1ms',
          description: 'Tempo de processamento'
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
          example: ['Percentual deve ser maior ou igual a zero']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async calculatePercentage(@Body() dto: CalculatePercentageDto): Promise<{
    result: number;
    calculation: string;
    calculationTime: string;
    metadata: {
      value: number;
      percentage: number;
      formula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculatePercentage(
      dto.value,
      dto.percentage
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      result: Number(result.toFixed(2)),
      calculation: `${dto.percentage}% de ${dto.value} = ${result.toFixed(2)}`,
      calculationTime,
      metadata: {
        value: dto.value,
        percentage: dto.percentage,
        formula: '(valor × percentual) ÷ 100'
      }
    };
  }

  @Post('percentage-of')
  @ApiOperation({ summary: 'Calcula que percentual um valor representa de outro (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Percentual calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        result: {
          type: 'number',
          example: 25,
          description: 'Percentual que a parte representa do total'
        },
        calculation: {
          type: 'string',
          example: '250 representa 25% de 1000',
          description: 'Descrição do cálculo realizado'
        },
        calculationTime: { type: 'string', example: '0ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou total igual a zero' })
  async calculatePercentageOf(@Body() dto: PercentageOfDto): Promise<{
    result: number;
    calculation: string;
    calculationTime: string;
    metadata: {
      part: number;
      total: number;
      formula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculatePercentageOf(
      dto.part,
      dto.total
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      result: Number(result.toFixed(2)),
      calculation: `${dto.part} representa ${result.toFixed(2)}% de ${dto.total}`,
      calculationTime,
      metadata: {
        part: dto.part,
        total: dto.total,
        formula: '(parte ÷ total) × 100'
      }
    };
  }

  @Post('percentage-change')
  @ApiOperation({ summary: 'Calcula a variação percentual entre dois valores (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Variação percentual calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        result: {
          type: 'number',
          example: 20,
          description: 'Variação percentual (positiva = aumento, negativa = diminuição)'
        },
        calculation: {
          type: 'string',
          example: 'Aumento de 20% (de 100 para 120)',
          description: 'Descrição da variação'
        },
        changeType: {
          type: 'string',
          enum: ['aumento', 'diminuição', 'sem alteração'],
          example: 'aumento'
        },
        calculationTime: { type: 'string', example: '1ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou valor inicial igual a zero' })
  async calculatePercentageChange(@Body() dto: PercentageChangeDto): Promise<{
    result: number;
    calculation: string;
    changeType: string;
    calculationTime: string;
    metadata: {
      oldValue: number;
      newValue: number;
      absoluteChange: number;
      formula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculatePercentageChange(
      dto.oldValue,
      dto.newValue
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const absoluteChange = dto.newValue - dto.oldValue;
    let changeType: string;
    let calculation: string;

    if (result > 0) {
      changeType = 'aumento';
      calculation = `Aumento de ${result.toFixed(2)}% (de ${dto.oldValue} para ${dto.newValue})`;
    } else if (result < 0) {
      changeType = 'diminuição';
      calculation = `Diminuição de ${Math.abs(result).toFixed(2)}% (de ${dto.oldValue} para ${dto.newValue})`;
    } else {
      changeType = 'sem alteração';
      calculation = `Sem alteração (${dto.oldValue} = ${dto.newValue})`;
    }

    return {
      result: Number(result.toFixed(2)),
      calculation,
      changeType,
      calculationTime,
      metadata: {
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        absoluteChange: Number(absoluteChange.toFixed(2)),
        formula: '((novo - antigo) ÷ antigo) × 100'
      }
    };
  }

  @Post('value-from-percentage')
  @ApiOperation({ summary: 'Calcula o valor total quando se conhece um percentual e seu valor (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Valor total calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        result: {
          type: 'number',
          example: 200,
          description: 'Valor total (100%)'
        },
        calculation: {
          type: 'string',
          example: 'Se 25% = 50, então 100% = 200',
          description: 'Descrição do cálculo'
        },
        calculationTime: { type: 'string', example: '0ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou percentual igual a zero' })
  async calculateValueFromPercentage(@Body() dto: ValueFromPercentageDto): Promise<{
    result: number;
    calculation: string;
    calculationTime: string;
    metadata: {
      percentage: number;
      percentageValue: number;
      formula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculateValueFromPercentage(
      dto.percentage,
      dto.percentageValue
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      result: Number(result.toFixed(2)),
      calculation: `Se ${dto.percentage}% = ${dto.percentageValue}, então 100% = ${result.toFixed(2)}`,
      calculationTime,
      metadata: {
        percentage: dto.percentage,
        percentageValue: dto.percentageValue,
        formula: '(valor do percentual × 100) ÷ percentual'
      }
    };
  }

  @Post('discount')
  @ApiOperation({ summary: 'Calcula desconto sobre um preço (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Desconto calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        discountAmount: {
          type: 'number',
          example: 20,
          description: 'Valor do desconto'
        },
        finalPrice: {
          type: 'number',
          example: 80,
          description: 'Preço final após desconto'
        },
        savings: {
          type: 'string',
          example: 'Você economiza R\$ 20,00',
          description: 'Descrição da economia'
        },
        calculationTime: { type: 'string', example: '1ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateDiscount(@Body() dto: DiscountDto): Promise<{
    discountAmount: number;
    finalPrice: number;
    savings: string;
    calculationTime: string;
    metadata: {
      originalPrice: number;
      discountPercentage: number;
      discountFormula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculateDiscount(
      dto.originalPrice,
      dto.discountPercentage
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      discountAmount: Number(result.discountAmount.toFixed(2)),
      finalPrice: Number(result.finalPrice.toFixed(2)),
      savings: `Você economiza R\$ ${result.discountAmount.toFixed(2)}`,
      calculationTime,
      metadata: {
        originalPrice: dto.originalPrice,
        discountPercentage: dto.discountPercentage,
        discountFormula: 'preço original - (preço × percentual desconto ÷ 100)'
      }
    };
  }

  @Post('markup')
  @ApiOperation({ summary: 'Calcula acréscimo/markup sobre um preço (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Markup calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        markupAmount: {
          type: 'number',
          example: 40,
          description: 'Valor do acréscimo'
        },
        finalPrice: {
          type: 'number',
          example: 120,
          description: 'Preço final após markup'
        },
        increase: {
          type: 'string',
          example: 'Acréscimo de R\$ 40,00',
          description: 'Descrição do acréscimo'
        },
        calculationTime: { type: 'string', example: '0ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateMarkup(@Body() dto: MarkupDto): Promise<{
    markupAmount: number;
    finalPrice: number;
    increase: string;
    calculationTime: string;
    metadata: {
      originalPrice: number;
      markupPercentage: number;
      markupFormula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculateMarkup(
      dto.originalPrice,
      dto.markupPercentage
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      markupAmount: Number(result.markupAmount.toFixed(2)),
      finalPrice: Number(result.finalPrice.toFixed(2)),
      increase: `Acréscimo de R\$ ${result.markupAmount.toFixed(2)}`,
      calculationTime,
      metadata: {
        originalPrice: dto.originalPrice,
        markupPercentage: dto.markupPercentage,
        markupFormula: 'preço original + (preço × percentual markup ÷ 100)'
      }
    };
  }

  @Post('profit-margin')
  @ApiOperation({ summary: 'Calcula margem de lucro (com cache)' })
  @ApiResponse({
    status: 201,
    description: 'Margem de lucro calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        profit: {
          type: 'number',
          example: 400,
          description: 'Lucro absoluto'
        },
        marginPercentage: {
          type: 'number',
          example: 40,
          description: 'Margem de lucro em percentual'
        },
        analysis: {
          type: 'string',
          example: 'Margem de lucro saudável',
          description: 'Análise da margem'
        },
        calculationTime: { type: 'string', example: '1ms' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou receita igual a zero' })
  async calculateProfitMargin(@Body() dto: ProfitMarginDto): Promise<{
    profit: number;
    marginPercentage: number;
    analysis: string;
    calculationTime: string;
    metadata: {
      revenue: number;
      cost: number;
      marginFormula: string;
    };
  }> {
    const startTime = Date.now();

    const result = await this.percentageCalculatorService.calculateProfitMargin(
      dto.revenue,
      dto.cost
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    let analysis: string;
    const margin = result.marginPercentage;

    if (margin < 0) {
      analysis = 'Prejuízo - custos superiores à receita';
    } else if (margin < 10) {
      analysis = 'Margem baixa - atenção necessária';
    } else if (margin < 20) {
      analysis = 'Margem moderada';
    } else if (margin < 40) {
      analysis = 'Margem saudável';
    } else {
      analysis = 'Margem excelente';
    }

    return {
      profit: Number(result.profit.toFixed(2)),
      marginPercentage: Number(result.marginPercentage.toFixed(2)),
      analysis,
      calculationTime,
      metadata: {
        revenue: dto.revenue,
        cost: dto.cost,
        marginFormula: '((receita - custo) ÷ receita) × 100'
      }
    };
  }

}