import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { BaseHelper } from '../../common/utils/helper/helper.util';

describe('SeederService', () => {
  let service: SeederService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedUsers', () => {
    beforeEach(() => {
      jest.spyOn(BaseHelper, 'hashData');
    });

    it('should create users if they do not exist', async () => {
      // Mock user not found
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock hash password
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(BaseHelper, 'hashData').mockResolvedValue(hashedPassword);

      // Mock create and save
      const mockCreatedUser = {
        id: '1',
        username: 'user1',
        password: hashedPassword,
      };
      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      await service.seedUsers();

      // Should check for 3 users
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(3);

      // Should create 3 users
      expect(mockUserRepository.create).toHaveBeenCalledTimes(3);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(3);

      // Verify first user creation
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'user1',
        password: hashedPassword,
      });
    });

    it('should skip existing users', async () => {
      // Mock existing user
      const existingUser = {
        id: '1',
        username: 'user1',
        password: 'existingHash',
      };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await service.seedUsers();

      // Should check for 3 users
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(3);

      // Should not create or save any users
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle mixed scenarios of existing and new users', async () => {
      // Mock user1 exists, user2 and user3 don't
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: '1', username: 'user1' }) // exists
        .mockResolvedValueOnce(null) // doesn't exist
        .mockResolvedValueOnce(null); // doesn't exist

      const hashedPassword = 'hashedPassword123';
      jest.spyOn(BaseHelper, 'hashData').mockResolvedValue(hashedPassword);

      await service.seedUsers();

      // Should check for all 3 users
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(3);

      // Should only create 2 new users
      expect(mockUserRepository.create).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);

      // Verify correct users were created
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'user2',
        password: hashedPassword,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'user3',
        password: hashedPassword,
      });
    });
  });

  describe('onModuleInit', () => {
    it('should call seedUsers on module initialization', async () => {
      const seedUsersSpy = jest.spyOn(service, 'seedUsers').mockResolvedValue();

      await service.onModuleInit();

      expect(seedUsersSpy).toHaveBeenCalled();
    });
  });
});
