import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisService } from '@modules/redis/redis.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let redisService: RedisService;
  let jwtService: JwtService;

  // Mock token with expiration time
  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjoxNzEwNDMwMDAwfQ.mock';
  const mockDecodedToken = {
    id: 1,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    redisService = module.get<RedisService>(RedisService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('blacklistToken', () => {
    it('should add token to blacklist with TTL', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedToken as any);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

      await service.blacklistToken(mockToken);

      expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should handle invalid token format', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      await service.blacklistToken('invalid-token');

      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedToken as any);
      jest
        .spyOn(redisService, 'set')
        .mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.blacklistToken(mockToken)).resolves.not.toThrow();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(true);

      const result = await service.isTokenBlacklisted(mockToken);

      expect(result).toBe(true);
      expect(redisService.get).toHaveBeenCalledWith(`blacklist:${mockToken}`);
    });

    it('should return false if token is not blacklisted', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(undefined);

      const result = await service.isTokenBlacklisted(mockToken);

      expect(result).toBe(false);
    });

    it('should return false on Redis error', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockRejectedValue(new Error('Redis error'));

      const result = await service.isTokenBlacklisted(mockToken);

      expect(result).toBe(false);
    });
  });

  describe('removeFromBlacklist', () => {
    it('should remove token from blacklist', async () => {
      jest.spyOn(redisService, 'del').mockResolvedValue(undefined);

      await service.removeFromBlacklist(mockToken);

      expect(redisService.del).toHaveBeenCalledWith(`blacklist:${mockToken}`);
    });

    it('should handle deletion errors', async () => {
      jest
        .spyOn(redisService, 'del')
        .mockRejectedValue(new Error('Delete error'));

      // Should not throw
      await expect(
        service.removeFromBlacklist(mockToken),
      ).resolves.not.toThrow();
    });
  });
});
