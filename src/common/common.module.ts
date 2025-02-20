// common.module.ts (or the module where you provide RolesGuard)
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { RolesGuard } from './guards/roles/roles.guard';
import { UsersService } from 'src/users/services/users.service';

@Module({
  imports: [UsersModule], // Make UsersModule available in CommonModule
  providers: [RolesGuard, UsersService], // Provide RolesGuard
  exports: [RolesGuard], // Export RolesGuard if needed
})
export class CommonModule {}