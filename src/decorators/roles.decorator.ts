import { SetMetadata } from '@nestjs/common';
import { Role } from '@shared/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to users whose JWT `role` claim matches one of the given
 * roles. Must be combined with `@UseGuards(RolesGuard)` on the same route or
 * controller.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
