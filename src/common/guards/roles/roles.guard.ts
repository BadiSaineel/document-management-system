import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../../users/services/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException();
    }
    const userWithRole = await this.usersService.findOneWithRoleAndPermissios(user.id);
    console.log("user",userWithRole);
    if (!userWithRole || !userWithRole.role || !userWithRole.role.permissions) {
        throw new UnauthorizedException();
    }
    const userPermissions = userWithRole.role.permissions.map(p => p.name);

    const hasPermission = requiredPermissions.every(requiredPermission =>
        userPermissions.includes(requiredPermission)
    );

    return hasPermission;
  }
}