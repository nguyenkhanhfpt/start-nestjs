import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { TokenBlacklistService } from '../services/token-blacklist.service';

/**
 * Token Blacklist Guard
 * Checks if a JWT token has been blacklisted (logged out)
 * Should be used in conjunction with JWT authentication guards
 */
@Injectable()
export class TokenBlacklistGuard implements CanActivate {
  private readonly logger = new Logger(TokenBlacklistGuard.name);

  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // No token provided - let other guards handle this
      return true;
    }

    // Check if token is blacklisted
    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      this.logger.warn('Attempt to use blacklisted token');
      throw new UnauthorizedException(
        'Token has been revoked. Please login again.',
      );
    }

    return true;
  }

  /**
   * Extract JWT token from Authorization header
   * @param request - HTTP request object
   * @returns Token string or undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
