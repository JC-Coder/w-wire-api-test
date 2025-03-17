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

@Injectable()
export class CurrencyService {
  private readonly APP_ID = ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_APP_ID;
  private readonly API_BASE_URL = ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_BASE_URL;

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
}
