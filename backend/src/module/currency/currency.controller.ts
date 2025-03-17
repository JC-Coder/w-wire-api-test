import { Controller, Get } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { IExchangeRateResponse } from '../../common/types/currency.types';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response.decorator';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Public()
  @Get('exchange-rates')
  @ResponseMessage('Exchange rates retrieved successfully')
  async getExchangeRates(): Promise<IExchangeRateResponse> {
    return this.currencyService.getCurrentExchangeRates();
  }
}
