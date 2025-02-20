import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
      ) {}
    
      async create(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
        const defaultRole = await this.rolesRepository.findOne({ where: { name: 'viewer' } });
        if (!defaultRole) {
          throw new NotFoundException('Default Role not found.');
        }
    
        const newUser = new User();
        newUser.username = createUserDto.username;
        newUser.email = createUserDto.email;
        newUser.password = hashedPassword;
        newUser.role = defaultRole;
        
        return this.usersRepository.save(newUser);
      }
    
      async findAll(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['role'] });
      }
    
      async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      }

      async findOneWithRole(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id }, relations: ['role'] });
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      }

      async findOneWithRoleAndPermissios(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id }, relations: ['role', 'role.permissions'] });
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      }
    
      async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username }, relations: ['role'] });
      }
    
      async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        if (updateUserDto.password) {
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        await this.usersRepository.update(id, updateUserDto);
        return this.findOne(id);
      }
    
      async remove(id: number): Promise<void> {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
}
