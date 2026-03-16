import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { UserEntity } from '@database/entities/user.entity';
import * as authUtils from '@shared/utils';

jest.mock('@shared/utils', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let tokenBlacklistService: TokenBlacklistService;
  let mockUserRepository: any;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password_here',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlRlc3QiLCJleHAiOjE3MTA0MzAwMDB9.mock';

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config: any = {
                'app.jwt.accessSecret': 'test-secret',
                'app.jwt.accessExpiresIn': '1h',
                'app.jwt.refreshSecret': 'refresh-secret',
                'app.jwt.refreshExpiresIn': '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            blacklistToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return login response with tokens', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw BadRequestException for invalid email', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid password', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should blacklist token on logout', async () => {
      jest.spyOn(tokenBlacklistService, 'blacklistToken').mockResolvedValue(undefined);

      const result = await service.logout(mockToken);

      expect(result).toBe(true);
      expect(tokenBlacklistService.blacklistToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle blacklist errors gracefully', async () => {
      jest
        .spyOn(tokenBlacklistService, 'blacklistToken')
        .mockRejectedValue(new Error('Redis error'));

      const result = await service.logout(mockToken);

      // Should still return true (logout succeeds for user)
      expect(result).toBe(true);
    });

    it('should return true even without token', async () => {
      const result = await service.logout(undefined as any);

      expect(result).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return user info', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUser(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should return user with password excluded', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUser(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('refresh', () => {
    it('should generate new access token', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.refresh('test@example.com', mockToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
