import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { BaseHelper } from '../../common/utils/helper/helper.util';
import { AppError } from '../../common/filter/app-error.filter';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const mockUsername = 'testuser';
      const mockUser = { id: '1', username: mockUsername };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(mockUsername);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = { id: '1', username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('validateCredentials', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      password: 'hashedPassword',
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAttempt: null,
    };

    beforeEach(() => {
      jest.spyOn(BaseHelper, 'compareHashedData');
    });

    it('should successfully validate correct credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 0,
      });
      jest.spyOn(BaseHelper, 'compareHashedData').mockResolvedValue(true);

      const result = await service.validateCredentials('testuser', 'password');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
    });

    it('should handle invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(BaseHelper, 'compareHashedData').mockResolvedValue(false);

      const result = await service.validateCredentials(
        'testuser',
        'wrongPassword',
      );

      expect(result).toBeNull();
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        failedLoginAttempts: 1,
        lastLoginAttempt: expect.any(Date),
      });
    });

    it('should lock account after max failed attempts', async () => {
      const lockedUser = {
        ...mockUser,
        failedLoginAttempts: 4,
      };
      mockUserRepository.findOne.mockResolvedValue(lockedUser);
      jest.spyOn(BaseHelper, 'compareHashedData').mockResolvedValue(false);

      const result = await service.validateCredentials(
        'testuser',
        'wrongPassword',
      );

      expect(result).toBeNull();
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...lockedUser,
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
        lastLoginAttempt: expect.any(Date),
      });
    });

    it('should reject login attempts for locked accounts', async () => {
      const lockedUser = {
        ...mockUser,
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 900000), // 15 minutes from now
      };
      mockUserRepository.findOne.mockResolvedValue(lockedUser);

      await expect(
        service.validateCredentials('testuser', 'password'),
      ).rejects.toThrow(AppError);
    });
  });
});
