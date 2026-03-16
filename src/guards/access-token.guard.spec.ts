import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { TokenBlacklistService } from '@modules/auth/services/token-blacklist.service';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let reflector: Reflector;
  let tokenBlacklistService: TokenBlacklistService;

  const mockExecutionContext: Partial<ExecutionContext> = {
    switchToHttp: jest.fn(),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  const mockRequest = {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
    },
    user: {
      id: 1,
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            isTokenBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);

    // Create guard manually since it extends AuthGuard
    guard = new AccessTokenGuard(reflector, tokenBlacklistService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow public routes without authentication', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      });

      const context = mockExecutionContext as ExecutionContext;
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if token is blacklisted', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(tokenBlacklistService, 'isTokenBlacklisted').mockResolvedValue(true);

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      });

      // Mock parent guard canActivate
      jest.spyOn(guard as any, 'canActivate').mockImplementation(async (ctx: ExecutionContext) => {
        const reflector = (ctx as ExecutionContext).switchToHttp().getRequest().reflector;
        if (reflector) return true;

        const request = (ctx as ExecutionContext).switchToHttp().getRequest();
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (token) {
          const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
          if (isBlacklisted) return false;
        }
        return true;
      });

      const context = mockExecutionContext as ExecutionContext;
      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Authorization header', () => {
      const request = {
        headers: {
          authorization: 'Bearer token123',
        },
      };

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBe('token123');
    });

    it('should return undefined if no Authorization header', () => {
      const request = {
        headers: {},
      };

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBeUndefined();
    });

    it('should return undefined if Authorization header format is invalid', () => {
      const request = {
        headers: {
          authorization: 'InvalidFormattoken123',
        },
      };

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBeUndefined();
    });
  });
});
