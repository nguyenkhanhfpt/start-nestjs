import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@decorators';
import { Role } from '@shared/enums/role.enum';

/**
 * RolesGuard - Restricts access to routes decorated with `@Roles(...)`.
 * Must run after AccessTokenGuard (applied globally) has already attached
 * `request.user` from the JWT payload.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // JWTs issued before the `role` claim existed default to USER.
    const userRole: Role = user?.role ?? Role.USER;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
