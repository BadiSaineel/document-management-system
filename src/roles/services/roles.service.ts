import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
      ) {}
    
      async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const role = new Role();
        role.name = createRoleDto.name;
    
        if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
            const permissions = await this.permissionsRepository.findBy({ id: In(createRoleDto.permissions) });
            role.permissions = permissions;
        }
    
        return this.rolesRepository.save(role);
      }
    
      async findAll(): Promise<Role[]> {
        return this.rolesRepository.find({ relations: ['permissions'] });
      }
    
      async findOne(id: number): Promise<Role> {
        const role = await this.rolesRepository.findOne({ where: { id }, relations: ['permissions'] });
        if (!role) {
          throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
      }
    
      async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        Object.assign(role, updateRoleDto);
        if (updateRoleDto.permissions) {
          const permissions = await this.permissionsRepository.findBy({ id: In(updateRoleDto.permissions) });
          role.permissions = permissions;
        }
    
        
    
        return this.rolesRepository.save(role);
      }
    
      async remove(id: number): Promise<string> {
        const result = await this.rolesRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return "Role deleted successfully";
      }
      
}
