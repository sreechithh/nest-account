import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.user;

    return this.matchRoles(roles, user.roles);
  }

  matchRoles(allowedRoles: string[], userRoles: Role[]): boolean {
    return userRoles.some((role) => allowedRoles.includes(role.name));
  }
}
