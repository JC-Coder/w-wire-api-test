import { Controller, Get, Post, Body } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { IExchangeRateResponse } from '../../common/types/currency.types';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { LoggedInUserDecorator } from '../../common/decorators/logged-in-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Public()
  @Get('exchange-rates')
  @ResponseMessage('Exchange rates retrieved successfully')
  async getExchangeRates(): Promise<IExchangeRateResponse> {
    return this.currencyService.getCurrentExchangeRates();
  }

  @Post('convert')
  @ResponseMessage('Currency converted successfully')
  async convertCurrency(
    @Body() payload: ConvertCurrencyDto,
    @LoggedInUserDecorator() user: User,
  ) {
    return this.currencyService.convertCurrency(payload, user);
  }
}
