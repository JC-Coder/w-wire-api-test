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
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Transaction } from '../database/entities/transaction.entity';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCache = CacheHelperUtil as jest.Mocked<typeof CacheHelperUtil>;

describe('CurrencyService', () => {
  let service: CurrencyService;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
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
        USD: 1,
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

    it('should handle empty response data', async () => {
      mockedCache.getCache.mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: null,
      });

      await expect(service.getCurrentExchangeRates()).rejects.toThrow(
        'Unable to retrieve exchanges rate, try again later',
      );
      expect(mockedCache.setCache).not.toHaveBeenCalled();
    });
  });

  describe('convertCurrency', () => {
    const mockUser = { id: '1', username: 'testuser' } as User;
    const mockRates = {
      timestamp: 1647907200,
      base: 'USD',
      rates: {
        EUR: 0.91,
        GBP: 0.76,
        JPY: 120.31,
        USD: 1,
      },
    };

    beforeEach(() => {
      jest
        .spyOn(service, 'getCurrentExchangeRates')
        .mockResolvedValue(mockRates);
    });

    it('should convert USD to EUR correctly', async () => {
      const payload = {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      };

      mockTransactionRepository.create.mockReturnValue({
        user: mockUser,
        ...payload,
        rate: mockRates.rates.EUR,
        result: payload.amount * mockRates.rates.EUR,
      });

      const result = await service.convertCurrency(payload, mockUser);

      expect(result).toEqual({
        amount: 100,
        rate: 0.91,
        result: 91,
      });

      expect(mockTransactionRepository.save).toHaveBeenCalledWith({
        user: mockUser,
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.91,
        result: 91,
      });
    });

    it('should convert EUR to USD correctly', async () => {
      const payload = {
        amount: 100,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
      };

      const expectedRate = mockRates.rates.USD;
      const expectedResult =
        (payload.amount / mockRates.rates.EUR) * expectedRate;

      mockTransactionRepository.create.mockReturnValue({
        user: mockUser,
        ...payload,
        rate: expectedRate,
        result: expectedResult,
      });

      const result = await service.convertCurrency(payload, mockUser);

      expect(result).toEqual({
        amount: 100,
        rate: expectedRate,
        result: expectedResult,
      });

      expect(mockTransactionRepository.save).toHaveBeenCalledWith({
        user: mockUser,
        ...payload,
        rate: expectedRate,
        result: expectedResult,
      });
    });

    it('should convert between non-USD currencies correctly', async () => {
      const payload = {
        amount: 100,
        fromCurrency: 'EUR',
        toCurrency: 'GBP',
      };

      // Convert EUR to USD first, then USD to GBP
      const amountInUsd = payload.amount / mockRates.rates.EUR;
      const expectedRate = mockRates.rates.GBP;
      const expectedResult = amountInUsd * expectedRate;

      mockTransactionRepository.create.mockReturnValue({
        user: mockUser,
        ...payload,
        rate: expectedRate,
        result: expectedResult,
      });

      const result = await service.convertCurrency(payload, mockUser);

      expect(result).toEqual({
        amount: 100,
        rate: expectedRate,
        result: expectedResult,
      });
    });

    it('should handle invalid source currency', async () => {
      const payload = {
        amount: 100,
        fromCurrency: 'INVALID',
        toCurrency: 'EUR',
      };

      await expect(service.convertCurrency(payload, mockUser)).rejects.toThrow(
        'Invalid currency code',
      );
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should handle invalid target currency', async () => {
      const payload = {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'INVALID',
      };

      await expect(service.convertCurrency(payload, mockUser)).rejects.toThrow(
        'Invalid currency code',
      );
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should handle zero amount conversion', async () => {
      const payload = {
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      };

      mockTransactionRepository.create.mockReturnValue({
        user: mockUser,
        ...payload,
        rate: mockRates.rates.EUR,
        result: 0,
      });

      const result = await service.convertCurrency(payload, mockUser);

      expect(result).toEqual({
        amount: 0,
        rate: mockRates.rates.EUR,
        result: 0,
      });
    });
  });
});
