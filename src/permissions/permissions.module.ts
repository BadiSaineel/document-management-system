import { Module } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { PermissionsController } from './controllers/permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, User, Role])],
  providers: [PermissionsService, RolesGuard, UsersService],
  controllers: [PermissionsController]
})
export class PermissionsModule {}
