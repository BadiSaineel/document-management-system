import { Module } from '@nestjs/common';
import { DocumentsService } from './services/documents.service';
import { DocumentsController } from './controllers/documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { UsersService } from '../users/services/users.service';
import { Role } from '../roles/entities/role.entity';
import { StorageService } from '../common/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, User, Role])],
  providers: [DocumentsService, RolesGuard, UsersService, StorageService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
