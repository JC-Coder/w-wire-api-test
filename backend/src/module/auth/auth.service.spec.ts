import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { BaseHelper } from '../../common/utils/helper/helper.util';
import { AppError } from '../../common/filter/app-error.filter';

// Mock the entire cache-helper.util module
jest.mock('../../common/utils/cache-helper.util', () => ({
  CacheHelperUtil: {
    getCache: jest.fn(),
    setCache: jest.fn(),
    removeFromCache: jest.fn(),
  },
}));

import { CacheHelperUtil } from '../../common/utils/cache-helper.util';

describe('AuthService', () => {
  let service: AuthService;
  // let jwtService: JwtService;
  // let userService: UserService;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'hashedpassword',
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserService = {
    validateCredentials: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // jwtService = module.get<JwtService>(JwtService);
    // userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  afterAll(async () => {
    jest.clearAllTimers();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = { username: 'testuser', password: 'password' };
      const mockToken = 'jwt.token.here';

      mockUserService.validateCredentials.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);
      jest
        .spyOn(BaseHelper, 'generateRandomString')
        .mockReturnValue('nonce123');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
        },
      });

      expect(CacheHelperUtil.setCache).toHaveBeenCalled();
    });

    it('should throw error with invalid credentials', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };

      mockUserService.validateCredentials.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(AppError);
    });
  });

  describe('validateToken', () => {
    const mockPayload = {
      sub: '1',
      username: 'testuser',
      nonce: 'nonce123',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    it('should return true for valid token', async () => {
      jest
        .spyOn(CacheHelperUtil, 'getCache')
        .mockResolvedValueOnce(null) // blacklist check
        .mockResolvedValueOnce(mockPayload.iat.toString()); // nonce check

      const result = await service.validateToken(mockPayload);
      expect(result).toBe(true);
    });

    it('should return false for blacklisted token', async () => {
      jest.spyOn(CacheHelperUtil, 'getCache').mockResolvedValueOnce('true'); // blacklist check

      const result = await service.validateToken(mockPayload);
      expect(result).toBe(false);
    });

    it('should return false for expired token', async () => {
      const expiredPayload = {
        ...mockPayload,
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      };

      jest
        .spyOn(CacheHelperUtil, 'getCache')
        .mockResolvedValueOnce(null) // blacklist check
        .mockResolvedValueOnce(expiredPayload.iat.toString()); // nonce check

      const result = await service.validateToken(expiredPayload);
      expect(result).toBe(false);
    });
  });
});
