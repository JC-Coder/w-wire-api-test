import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('health check', () => {
    it('should return health status', () => {
      // Mock the current date for consistent testing
      const mockDate = new Date('2025-03-16T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Mock process.uptime() and process.memoryUsage()
      const mockUptime = 3600; // 1 hour in seconds
      const mockMemoryUsage = 100 * 1024 * 1024; // 100MB in bytes
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: mockMemoryUsage,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
      });

      const result = appController.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: mockDate.toISOString(),
        uptime: mockUptime,
        memoryUsage: mockMemoryUsage / 1024 / 1024, // Convert to MB
      });

      // Clean up mocks
      jest.restoreAllMocks();
    });
  });
});
