import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestmentCalculatorService } from '../../../../application/services';
import { CompoundInterestDto, FutureValueDto, ROIDto, SimpleInterestDto } from './dtos';


@ApiTags('Calculadora de Investimento')
@Controller('calculators/investment')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class InvestmentCalculatorController {
  constructor(private readonly investmentCalculatorService: InvestmentCalculatorService) { }

  @Post('future-value')
  @ApiOperation({ summary: 'Calcula o valor futuro do investimento (com cache)' })
  @ApiResponse({ status: 201, description: 'Valor futuro calculado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateFutureValue(@Body() dto: FutureValueDto): Promise<{
    futureValue: number;
    totalInvested: number;
    totalEarnings: number;
    calculationTime: string;
    metadata: {
      initialInvestment: number;
      monthlyDeposit: number;
      annualInterestRate: number;
      years: number;
      months: number;
    };
  }> {
    const startTime = Date.now();

    const futureValue = await this.investmentCalculatorService.calculateFutureValue(
      dto.initialInvestment,
      dto.monthlyDeposit,
      dto.annualInterestRate,
      dto.years
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const totalInvested = dto.initialInvestment + (dto.monthlyDeposit * dto.years * 12);
    const totalEarnings = futureValue - totalInvested;

    return {
      futureValue: Number(futureValue.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      totalEarnings: Number(totalEarnings.toFixed(2)),
      calculationTime,
      metadata: {
        initialInvestment: dto.initialInvestment,
        monthlyDeposit: dto.monthlyDeposit,
        annualInterestRate: dto.annualInterestRate,
        years: dto.years,
        months: dto.years * 12
      }
    };
  }

  @Post('compound-interest')
  @ApiOperation({ summary: 'Calcula juros compostos (com cache)' })
  @ApiResponse({ status: 201, description: 'Juros compostos calculados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateCompoundInterest(@Body() dto: CompoundInterestDto): Promise<{
    finalAmount: number;
    interest: number;
    calculationTime: string;
    metadata: {
      principal: number;
      rate: number;
      time: number;
      frequency: number;
    };
  }> {
    const startTime = Date.now();
    const frequency = dto.frequency || 12;

    const finalAmount = await this.investmentCalculatorService.calculateCompoundInterest(
      dto.principal,
      dto.rate / 100,
      dto.time,
      frequency
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const interest = finalAmount - dto.principal;

    return {
      finalAmount: Number(finalAmount.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      calculationTime,
      metadata: {
        principal: dto.principal,
        rate: dto.rate,
        time: dto.time,
        frequency
      }
    };
  }

  @Post('simple-interest')
  @ApiOperation({ summary: 'Calcula juros simples (com cache)' })
  @ApiResponse({ status: 201, description: 'Juros simples calculados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateSimpleInterest(@Body() dto: SimpleInterestDto): Promise<{
    finalAmount: number;
    interest: number;
    calculationTime: string;
    metadata: {
      principal: number;
      rate: number;
      time: number;
    };
  }> {
    const startTime = Date.now();

    const finalAmount = await this.investmentCalculatorService.calculateSimpleInterest(
      dto.principal,
      dto.rate / 100,
      dto.time
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    const interest = finalAmount - dto.principal;

    return {
      finalAmount: Number(finalAmount.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      calculationTime,
      metadata: {
        principal: dto.principal,
        rate: dto.rate,
        time: dto.time
      }
    };
  }

  @Post('roi')
  @ApiOperation({ summary: 'Calcula ROI - Return on Investment (com cache)' })
  @ApiResponse({ status: 201, description: 'ROI calculado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async calculateROI(@Body() dto: ROIDto): Promise<{
    roi: number;
    roiPercentage: number;
    calculationTime: string;
    metadata: {
      initialInvestment: number;
      finalValue: number;
    };
  }> {
    const startTime = Date.now();

    const result = await this.investmentCalculatorService.calculateROI(
      dto.initialInvestment,
      dto.finalValue
    );

    const endTime = Date.now();
    const calculationTime = `${endTime - startTime}ms`;

    return {
      roi: Number(result.roi.toFixed(2)),
      roiPercentage: Number(result.roiPercentage.toFixed(2)),
      calculationTime,
      metadata: {
        initialInvestment: dto.initialInvestment,
        finalValue: dto.finalValue
      }
    };
  }

}