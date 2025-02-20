import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { RolesController } from './controllers/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  providers: [RolesService, RolesGuard, UsersService],
  controllers: [RolesController]
})
export class RolesModule {}
