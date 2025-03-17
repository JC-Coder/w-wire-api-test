import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { ENVIRONMENT_VARIABLES } from '../../common/configs/environment';
import axios from 'axios';
import { CACHE_KEYS } from '../../common/constants/cache.constant';

// Mock the entire cache-helper.util module
jest.mock('../../common/utils/cache-helper.util', () => ({
  CacheHelperUtil: {
    getCache: jest.fn(),
    setCache: jest.fn(),
    removeFromCache: jest.fn(),
  },
}));

// Import the mocked module after mocking it
import { CacheHelperUtil } from '../../common/utils/cache-helper.util';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCache = CacheHelperUtil as jest.Mocked<typeof CacheHelperUtil>;

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyService],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentExchangeRates', () => {
    const mockResponse = {
      disclaimer: 'Usage subject to terms: https://openexchangerates.org/terms',
      license: 'https://openexchangerates.org/license',
      timestamp: 1647907200,
      base: 'USD',
      rates: {
        EUR: 0.91,
        GBP: 0.76,
        JPY: 120.31,
      },
    };

    const expectedResult = {
      timestamp: mockResponse.timestamp,
      base: mockResponse.base,
      rates: mockResponse.rates,
    };

    it('should return cached exchange rates if available', async () => {
      mockedCache.getCache.mockResolvedValueOnce(expectedResult);

      const result = await service.getCurrentExchangeRates();

      expect(result).toEqual(expectedResult);
      expect(mockedCache.getCache).toHaveBeenCalledWith(
        CACHE_KEYS.EXCHANGE_RATES,
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache exchange rates if not cached', async () => {
      mockedCache.getCache.mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockResponse,
      });

      const result = await service.getCurrentExchangeRates();

      expect(result).toEqual(expectedResult);
      expect(mockedCache.getCache).toHaveBeenCalledWith(
        CACHE_KEYS.EXCHANGE_RATES,
      );
      expect(mockedCache.setCache).toHaveBeenCalledWith(
        CACHE_KEYS.EXCHANGE_RATES,
        expectedResult,
        expect.any(Number),
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_BASE_URL}/latest.json`,
        {
          params: {
            app_id: ENVIRONMENT_VARIABLES.OPEN_EXCHANGE_APP_ID,
          },
        },
      );
    });

    it('should handle API errors', async () => {
      mockedCache.getCache.mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({
        status: 400,
        data: null,
      });

      await expect(service.getCurrentExchangeRates()).rejects.toThrow(
        'Unable to retrieve exchanges rate, try again later',
      );
      expect(mockedCache.setCache).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockedCache.getCache.mockResolvedValueOnce(null);
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getCurrentExchangeRates()).rejects.toThrow(
        'Network error',
      );
      expect(mockedCache.setCache).not.toHaveBeenCalled();
    });
  });
});
