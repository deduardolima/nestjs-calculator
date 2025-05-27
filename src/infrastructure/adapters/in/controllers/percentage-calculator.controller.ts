import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PercentageCalculatorService } from '../../../../application/services/percentage-calculator.service';
import { 
  PercentageChangeDto, 
  PercentageOfDto, 
  PercentageDifferenceDto 
} from './dtos/percentage-calculator.dto';

@ApiTags('Calculadora de Percentuais')
@Controller('calculators/percentage')
export class PercentageCalculatorController {
  constructor(private readonly percentageCalculatorService: PercentageCalculatorService) {}

  @Post('percentage-change')
  @ApiOperation({ summary: 'Calcula o valor após aplicação de percentual (aumento ou desconto)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Valor após percentual calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        result: {
          type: 'number',
          example: 1150,
          description: 'Valor após aplicação do percentual'
        }
      }
    }
  })
  calculatePercentageChange(@Body() dto: PercentageChangeDto): { result: number } {
    const result = this.percentageCalculatorService.calculatePercentageChange(
      dto.value,
      dto.percentage,
      dto.isIncrease
    );
    return { result };
  }

  @Post('percentage-of')
  @ApiOperation({ summary: 'Calcula que porcentagem um valor representa de outro' })
  @ApiResponse({ 
    status: 200, 
    description: 'Percentual calculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        percentage: {
          type: 'number',
          example: 25,
          description: 'Percentual que o valor representa'
        }
      }
    }
  })
  calculatePercentageOf(@Body() dto: PercentageOfDto): { percentage: number } {
    const percentage = this.percentageCalculatorService.calculatePercentageOf(
      dto.part,
      dto.whole
    );
    return { percentage };
  }

  @Post('percentage-difference')
  @ApiOperation({ summary: 'Calcula a diferença percentual entre dois valores' })
  @ApiResponse({ 
    status: 200, 
    description: 'Diferença percentual calculada com sucesso',
    schema: {
      type: 'object',
      properties: {
        difference: {
          type: 'number',
          example: 20,
          description: 'Diferença percentual entre os valores'
        }
      }
    }
  })
  calculatePercentageDifference(@Body() dto: PercentageDifferenceDto): { difference: number } {
    const difference = this.percentageCalculatorService.calculatePercentageDifference(
      dto.value1,
      dto.value2
    );
    return { difference };
  }
}