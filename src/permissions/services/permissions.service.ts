import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
      ) {}
    
      async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const permission = this.permissionsRepository.create(createPermissionDto);
        return this.permissionsRepository.save(permission);
      }
    
      async findAll(): Promise<Permission[]> {
        return this.permissionsRepository.find();
      }
    
      async findOne(id: number): Promise<Permission> {
        const permission = await this.permissionsRepository.findOne({ where: { id } });
        if (!permission) {
          throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
      }
    
      async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        await this.permissionsRepository.update(id, updatePermissionDto);
        return this.findOne(id);
      }
    
      async remove(id: number): Promise<string> {
        const result = await this.permissionsRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return "Permission removed successsfully";
      }
}
