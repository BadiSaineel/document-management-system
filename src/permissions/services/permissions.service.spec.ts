import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { NotFoundException } from '@nestjs/common';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a permission', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'Test Permission' };
      const createdPermission: Permission = { 
        id: 1, 
        name: 'Test Permission',
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      };

      (repository.create as jest.Mock).mockReturnValue(createdPermission);
      (repository.save as jest.Mock).mockResolvedValue(createdPermission);

      const result = await service.create(createPermissionDto);

      expect(repository.create).toHaveBeenCalledWith(createPermissionDto);
      expect(repository.save).toHaveBeenCalledWith(createdPermission);
      expect(result).toEqual(createdPermission);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions: Permission[] = [
        {
          id: 1,
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
          description: ''
        },
        {
          id: 2,
          name: 'Test2',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
          description: ''
        },
      ];
      (repository.find as jest.Mock).mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('findOne', () => {
    it('should return a permission by ID', async () => {
      const permission: Permission = {
        id: 1,
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        description: ''
      };
      (repository.findOne as jest.Mock).mockResolvedValue(permission);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(permission);
    });

    it('should throw NotFoundException if permission is not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'Updated Permission' };
      const updatedPermission: Permission = {
        id: 1,
        name: 'Updated Permission',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        description: ''
      };
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };

      (repository.update as jest.Mock).mockResolvedValue(updateResult);
      (repository.findOne as jest.Mock).mockResolvedValue(updatedPermission);

      const result = await service.update(1, updatePermissionDto);

      expect(repository.update).toHaveBeenCalledWith(1, updatePermissionDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedPermission);
    });

    it('should throw NotFoundException if permission to update is not found', async () => {
      const updatePermissionDto: UpdatePermissionDto = { name: 'Updated Permission' };
      const updateResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };

      (repository.update as jest.Mock).mockResolvedValue(updateResult);

      await expect(service.update(1, updatePermissionDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const deleteResult = { affected: 1 };
      (repository.delete as jest.Mock).mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual('Permission removed successsfully');
    });

    it('should throw NotFoundException if permission to remove is not found', async () => {
      const deleteResult = { affected: 0 };
      (repository.delete as jest.Mock).mockResolvedValue(deleteResult);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});