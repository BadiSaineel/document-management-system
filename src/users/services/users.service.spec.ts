import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../../roles/entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user with hashed password and default role', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      const hashedPassword = 'hashedPassword';
      const defaultRole: Role = { id: 1, name: 'viewer' } as Role;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (rolesRepository.findOne as jest.Mock).mockResolvedValue(defaultRole);

      const newUser: User = {
        id: 1,
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        role: defaultRole,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: []
      };

      (usersRepository.create as jest.Mock).mockReturnValue(newUser);
      (usersRepository.save as jest.Mock).mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(rolesRepository.findOne).toHaveBeenCalledWith({ where: { name: 'viewer' } });
      expect(usersRepository.create).toHaveBeenCalledWith(newUser);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw NotFoundException if default role is not found', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };

      (rolesRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.create(createUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users with role relation', async () => {
      const users: User[] = [{
        id: 1, username: 'test', role: { name: 'testRole' } as Role, createdAt: new Date(), updatedAt: new Date(),
        email: '',
        password: '',
        documents: []
      }];
      (usersRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(usersRepository.find).toHaveBeenCalledWith({ relations: ['role'] });
      expect(result).toEqual(users);
    });
  });



  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: 1, username: 'test', createdAt: new Date(), updatedAt: new Date(),
        email: '',
        password: '',
        role: new Role,
        documents: []
      };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneWithRole', () => {
    it('should return a user by ID with role', async () => {
      const user: User = {
        id: 1, username: 'test', role: { name: 'testRole' } as Role, createdAt: new Date(), updatedAt: new Date(),
        email: '',
        password: '',
        documents: []
      };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneWithRole(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['role'] });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOneWithRole(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneWithRoleAndPermissios', () => {
    it('should return a user by ID with role and permissions', async () => {
      const user: User = {
        id: 1, username: 'test', role: { name: 'testRole', permissions: [] } as unknown as Role, createdAt: new Date(), updatedAt: new Date(),
        email: '',
        password: '',
        documents: []
      };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneWithRoleAndPermissios(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['role', 'role.permissions'] });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOneWithRoleAndPermissios(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username with role', async () => {
      const user: User = {
        id: 1, username: 'test', role: { name: 'testRole' } as Role, createdAt: new Date(), updatedAt: new Date(),
        email: '',
        password: '',
        documents: []
      };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneByUsername('test');

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { username: 'test' }, relations: ['role'] });
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findOneByUsername('test');

      expect(result).toBeNull();
    });
  });
  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser' };
      const updatedUser: User = {
        id: 1,
        username: 'updateduser',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 1, name: 'testRole' } as Role
        ,
        email: '',
        password: '',
        documents: []
      };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };


      (usersRepository.findOne as jest.Mock).mockResolvedValue(updatedUser);
      (usersRepository.update as jest.Mock).mockResolvedValue(updateResult);

      const result = await service.update(1, updateUserDto);

      expect(usersRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedUser);
    });

    it('should hash the password if provided in the update DTO', async () => {
      const updateUserDto: UpdateUserDto = { password: 'newpassword' };
      const hashedPassword = 'hashedNewPassword';
      const updatedUser: User = {
        id: 1,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 1, name: 'testRole' } as Role
        ,
        username: '',
        email: '',
        documents: []
      };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (usersRepository.findOne as jest.Mock).mockResolvedValue(updatedUser);
      (usersRepository.update as jest.Mock).mockResolvedValue(updateResult);

      const result = await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(usersRepository.update).toHaveBeenCalledWith(1, { password: hashedPassword });
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedUser);
    });

        it('should throw NotFoundException if user to update is not found', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser' };
      const updateResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };

      (usersRepository.update as jest.Mock).mockResolvedValue(updateResult);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const deleteResult = { affected: 1 };
      (usersRepository.delete as jest.Mock).mockResolvedValue(deleteResult);

      await service.remove(1);

      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
        const deleteResult = { affected: 0 };
        (usersRepository.delete as jest.Mock).mockResolvedValue(deleteResult);

        await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
