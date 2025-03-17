import { Injectable, BadRequestException } from '@nestjs/common';
import { ENVIRONMENT_VARIABLES } from '../../common/configs/environment';
import {
  IExchangeRateResponse,
  IOpenExchangeResponse,
} from '../../common/types/currency.types';
import axios from 'axios';
import { CacheHelperUtil } from '../../common/utils/cache-helper.util';
import {
  CACHE_EXPIRY,
  CACHE_KEYS,
} from '../../common/constants/cache.constant';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class CurrencyService {
  private readonly APP_ID = ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_APP_ID;
  private readonly API_BASE_URL = ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_BASE_URL;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getCurrentExchangeRates(): Promise<IExchangeRateResponse> {
    const cachedData = await CacheHelperUtil.getCache(
      CACHE_KEYS.EXCHANGE_RATES,
    );
    if (cachedData) {
      return cachedData as IExchangeRateResponse;
    }

    const response = await axios.get<IOpenExchangeResponse>(
      `${this.API_BASE_URL}/latest.json`,
      {
        params: {
          app_id: this.APP_ID,
        },
      },
    );

    if (response.status !== 200 || !response?.data) {
      throw new BadRequestException(
        'Unable to retrieve exchanges rate, try again later',
      );
    }

    const responseData = response.data;

    const finalRes = {
      timestamp: responseData.timestamp,
      base: responseData.base,
      rates: responseData.rates,
    };

    await CacheHelperUtil.setCache(
      CACHE_KEYS.EXCHANGE_RATES,
      finalRes,
      CACHE_EXPIRY.THIRTY_MINUTES,
    );

    return finalRes;
  }

  async convertCurrency(
    payload: ConvertCurrencyDto,
    user: User,
  ): Promise<{ amount: number; rate: number; result: number }> {
    const { fromCurrency, toCurrency, amount } = payload;

    const rates = await this.getCurrentExchangeRates();

    if (!rates.rates[fromCurrency] || !rates.rates[toCurrency]) {
      throw new BadRequestException('Invalid currency code');
    }

    // Convert to USD first (base currency) if not USD
    const amountInUsd =
      fromCurrency === 'USD' ? amount : amount / rates.rates[fromCurrency];

    // Convert from USD to target currency
    const rate = rates.rates[toCurrency];
    const result = amountInUsd * rate;

    // Store the transaction
    await this.transactionRepository.save(
      this.transactionRepository.create({
        user,
        amount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        rate,
        result,
      }),
    );

    return {
      amount,
      rate,
      result,
    };
  }
}
