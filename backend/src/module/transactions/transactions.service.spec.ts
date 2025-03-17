import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../database/entities/transaction.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransactions = [
    {
      id: '1',
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.91,
      result: 91,
      createdAt: new Date('2024-03-01'),
      user: { id: '1' },
    },
    {
      id: '2',
      amount: 200,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      rate: 1.1,
      result: 220,
      createdAt: new Date('2024-03-02'),
      user: { id: '1' },
    },
  ];

  const mockTransactionRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTransactions', () => {
    it('should return paginated user transactions with default pagination', async () => {
      const userId = '1';
      mockTransactionRepository.findAndCount.mockResolvedValue([
        mockTransactions,
        mockTransactions.length,
      ]);

      const result = await service.getUserTransactions(userId, {});

      expect(result).toEqual({
        data: mockTransactions,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(mockTransactionRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
        },
        order: {
          createdAt: 'DESC',
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return paginated user transactions with custom pagination', async () => {
      const userId = '1';
      const paginationDto = { page: 2, limit: 5 };
      mockTransactionRepository.findAndCount.mockResolvedValue([
        [mockTransactions[1]],
        mockTransactions.length,
      ]);

      const result = await service.getUserTransactions(userId, paginationDto);

      expect(result).toEqual({
        data: [mockTransactions[1]],
        meta: {
          total: 2,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      });

      expect(mockTransactionRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
        },
        order: {
          createdAt: 'DESC',
        },
        skip: 5,
        take: 5,
      });
    });

    it('should handle empty transactions result', async () => {
      const userId = '1';
      mockTransactionRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getUserTransactions(userId, {});

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it('should calculate total pages correctly', async () => {
      const userId = '1';
      const paginationDto = { limit: 1 };
      mockTransactionRepository.findAndCount.mockResolvedValue([
        [mockTransactions[0]],
        mockTransactions.length,
      ]);

      const result = await service.getUserTransactions(userId, paginationDto);

      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 1,
        totalPages: 2,
      });
    });
  });
});
