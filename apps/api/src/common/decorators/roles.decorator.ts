import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@one-day-pub/interface/types/user.type.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
