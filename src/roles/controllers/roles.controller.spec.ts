import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import {
  CREATE_ROLE,
  DELETE_ROLE,
  EDIT_ROLE,
  MANAGE_ROLE,
  VIEW_ROLE,
} from '../../common/constants/db.constants';
import { Reflector } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;
  let app: INestApplication;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
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

      app = module.createNestApplication();
      controller = app.get<RolesController>(RolesController);
      service = app.get<RolesService>(RolesService);
      reflector = app.get<Reflector>(Reflector);

      await app.init();

  });

  afterEach(async () => {
    await app.close();
  });

  describe('Guards and Decorators', () => {

    it('should have correct permissions for each method', () => {


      expect(reflector.get).toHaveBeenCalledWith('permissions', RolesController.prototype.create);
      expect((reflector.get as jest.Mock).mock.calls[0][1]).toEqual(RolesController.prototype.create);
      expect((reflector.get as jest.Mock).mock.calls[0][0]).toEqual('permissions');

      expect(reflector.get).toHaveBeenCalledWith('permissions', RolesController.prototype.findAll);
      expect((reflector.get as jest.Mock).mock.calls[1][1]).toEqual(RolesController.prototype.findAll);
      expect((reflector.get as jest.Mock).mock.calls[1][0]).toEqual('permissions');

      expect(reflector.get).toHaveBeenCalledWith('permissions', RolesController.prototype.findOne);
      expect((reflector.get as jest.Mock).mock.calls[2][1]).toEqual(RolesController.prototype.findOne);
      expect((reflector.get as jest.Mock).mock.calls[2][0]).toEqual('permissions');

      expect(reflector.get).toHaveBeenCalledWith('permissions', RolesController.prototype.update);
      expect((reflector.get as jest.Mock).mock.calls[3][1]).toEqual(RolesController.prototype.update);
      expect((reflector.get as jest.Mock).mock.calls[3][0]).toEqual('permissions');

      expect(reflector.get).toHaveBeenCalledWith('permissions', RolesController.prototype.remove);
      expect((reflector.get as jest.Mock).mock.calls[4][1]).toEqual(RolesController.prototype.remove);
      expect((reflector.get as jest.Mock).mock.calls[4][0]).toEqual('permissions');
    });
  });
});