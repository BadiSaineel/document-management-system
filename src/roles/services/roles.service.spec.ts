import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOperator } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepository: Repository<Role>;
  let permissionsRepository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionsRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role with permissions', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Test Role',
        permissions: [1, 2],
      };
      const permissions: Permission[] = [
        { id: 1, name: 'Permission 1', createdAt: new Date(), updatedAt: new Date() } as Permission,
        { id: 2, name: 'Permission 2', createdAt: new Date(), updatedAt: new Date() } as Permission,
      ];
      const createdRole: Role = {
        id: 1,
        name: createRoleDto.name,
        permissions: permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: []
      };

      (permissionsRepository.findBy as jest.Mock).mockResolvedValue(permissions);
      (rolesRepository.save as jest.Mock).mockResolvedValue(createdRole);

      const result = await service.create(createRoleDto);

      expect(permissionsRepository.findBy).toHaveBeenCalledWith({ id: new FindOperator('in', createRoleDto.permissions) });
      expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: createRoleDto.name, permissions }));
      expect(result).toEqual(createdRole);
    });

    it('should create a role without permissions', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Test Role',
        permissions: [],
      };
      const createdRole: Role = {
        id: 1,
        name: createRoleDto.name,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        users: []
      };

      (rolesRepository.save as jest.Mock).mockResolvedValue(createdRole);

      const result = await service.create(createRoleDto);

      expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: createRoleDto.name, permissions: [] }));
      expect(result).toEqual(createdRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles with permissions', async () => {
      const roles: Role[] = [{
        id: 1, name: 'Test Role', permissions: [], createdAt: new Date(), updatedAt: new Date(), users: []
      }];
      (rolesRepository.find as jest.Mock).mockResolvedValue(roles);

      const result = await service.findAll();

      expect(rolesRepository.find).toHaveBeenCalledWith({ relations: ['permissions'] });
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by ID with permissions', async () => {
      const role: Role = {
        id: 1, name: 'Test Role', permissions: [], createdAt: new Date(), updatedAt: new Date(), users: []
      };
      (rolesRepository.findOne as jest.Mock).mockResolvedValue(role);

      const result = await service.findOne(1);

      expect(rolesRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['permissions'] });
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role is not found', async () => {
      (rolesRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role with permissions', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: 'Updated Role',
        permissions: [1, 2],
      };
      const permissions: Permission[] = [
        { id: 1, name: 'Permission 1', createdAt: new Date(), updatedAt: new Date() } as Permission,
        { id: 2, name: 'Permission 2', createdAt: new Date(), updatedAt: new Date() } as Permission,
      ];
      const updatedRole: Role = {
        id: 1,
        name: updateRoleDto.name || "",
        permissions: permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: []
      };

      const existingRole = { id: 1, permissions: [], createdAt: new Date(), updatedAt: new Date() } as unknown as Role;

      (rolesRepository.findOne as jest.Mock).mockResolvedValue(existingRole);
      (permissionsRepository.findBy as jest.Mock).mockResolvedValue(permissions);
      (rolesRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.update(1, updateRoleDto);

      expect(rolesRepository.findOne).toHaveBeenCalledWith(1);
      expect(permissionsRepository.findBy).toHaveBeenCalledWith({ id: new FindOperator('in', updateRoleDto.permissions) });
      expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: updateRoleDto.name, permissions }));
      expect(result).toEqual(updatedRole);
    });

    it('should update a role without permissions', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'Updated Role' };
      const updatedRole: Role = {
        id: 1,
        name: updateRoleDto.name || "",
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        users: []
      };

      const existingRole = { id: 1, permissions: [{id: 1, name: 'test', createdAt: new Date(), updatedAt: new Date()}], createdAt: new Date(), updatedAt: new Date() } as Role;

      (rolesRepository.findOne as jest.Mock).mockResolvedValue(existingRole);
      (rolesRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.update(1, updateRoleDto);

      expect(rolesRepository.findOne).toHaveBeenCalledWith(1);
      expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: updateRoleDto.name, permissions: [] }));
      expect(result).toEqual(updatedRole);
    });

    it('should throw NotFoundException if role to update is not found', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'Updated Role' };
      (rolesRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.update(1, updateRoleDto)).rejects.toThrow(NotFoundException);
    });
  });
  describe('remove', () => {
    it('should remove a role', async () => {
      const deleteResult = { affected: 1 };
      (rolesRepository.delete as jest.Mock).mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(rolesRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual('Role deleted successfully');
    });

    it('should throw NotFoundException if role to remove is not found', async () => {
      const deleteResult = { affected: 0 };
      (rolesRepository.delete as jest.Mock).mockResolvedValue(deleteResult);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});