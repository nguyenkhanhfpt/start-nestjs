import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@decorators';
import { TokenBlacklistService } from '@modules/auth/services/token-blacklist.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super();
  }

  /**
   * canActivate - Validates JWT and checks token blacklist
   * @param context - Execution context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Validate JWT token first
    await super.canActivate(context);

    // Check if token is blacklisted
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      const isBlacklisted =
        await this.tokenBlacklistService.isTokenBlacklisted(token);

      if (isBlacklisted) {
        this.logger.warn('Attempt to use blacklisted token');
        return false;
      }
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
