import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { RolesGuard } from './guards/roles/roles.guard';
import { UsersService } from 'src/users/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { Document } from 'src/documents/entities/document.entity';

@Module({
  imports: [UsersModule,TypeOrmModule.forFeature([Document, User, Role])],
  providers: [RolesGuard, UsersService],
  exports: [RolesGuard],
})
export class CommonModule {}