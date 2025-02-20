import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { Reflector } from '@nestjs/core';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call permissionsService.create with DTO', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'Test Permission' };
      await controller.create(createPermissionDto);
      expect(service.create).toHaveBeenCalledWith(createPermissionDto);
    });
  });

  describe('findAll', () => {
    it('should call permissionsService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call permissionsService.findOne with ID', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call permissionsService.update with ID and DTO', async () => {
      const id = '1';
      const updatePermissionDto: UpdatePermissionDto = { name: 'Updated Permission' };
      await controller.update(id, updatePermissionDto);
      expect(service.update).toHaveBeenCalledWith(+id, updatePermissionDto);
    });
  });

  describe('remove', () => {
    it('should call permissionsService.remove with ID', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });
  });

  describe('Guards and Decorators', () => {
    it('should use JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', PermissionsController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('should have correct permissions', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'test' };
      await controller.create(createPermissionDto);

      await controller.findAll();

      const id = '1';
      await controller.findOne(id);

      const updatePermissionDto: UpdatePermissionDto = { name: 'updated' };
      await controller.update(id, updatePermissionDto);

      await controller.remove(id);

      const expectedCalls = [
        ['permissions', PermissionsController.prototype.create],
        ['permissions', PermissionsController.prototype.findAll],
        ['permissions', PermissionsController.prototype.findOne],
        ['permissions', PermissionsController.prototype.update],
        ['permissions', PermissionsController.prototype.remove],
      ];

      expect((reflector.get as jest.Mock).mock.calls.length).toBe(expectedCalls.length);

      expectedCalls.forEach(call => {
        expect(reflector.get).toHaveBeenCalledWith(...call);
      });
    });
  });
});