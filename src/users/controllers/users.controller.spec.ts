import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { Reflector } from '@nestjs/core';
import {
  CREATE_USER,
  DELETE_USER,
  EDIT_USER,
  VIEW_USER,
} from '../../common/constants/db.constants';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with the provided DTO', async () => {
      const createUserDto: CreateUserDto = { username: 'test' } as CreateUserDto; // Partial DTO
      await controller.create(createUserDto);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return the user from the decorator', async () => {
      const user: User = { id: 1, username: 'test', createdAt: new Date(), updatedAt: new Date() } as User; // Mock User
      const result = controller.getMe(user);
      expect(result).toEqual(user);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with the provided ID', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should call usersService.update with the provided ID and DTO', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { username: 'updated' } as UpdateUserDto; // Partial DTO
      await controller.update(id, updateUserDto);
      expect(service.update).toHaveBeenCalledWith(+id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with the provided ID', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });
  });

  describe('Guards and Decorators', () => {
    it('should use JwtAuthGuard and RolesGuard for create, findAll, findOne, update, and remove', () => {
      const methods = ['create', 'findAll', 'findOne', 'update', 'remove'];
      methods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', UsersController.prototype[method]);
        expect(guards).toContain(JwtAuthGuard);
        expect(guards).toContain(RolesGuard);
      });
    });

    it('should use JwtAuthGuard for getMe', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController.prototype.getMe);
      expect(guards).toContain(JwtAuthGuard);
    });


    it('should have correct permissions for each method', async () => {
      const createUserDto: CreateUserDto = { username: 'test' } as CreateUserDto;
      await controller.create(createUserDto);

      const user: User = { id: 1, username: 'test', createdAt: new Date(), updatedAt: new Date() } as User;
      await controller.findAll();

      const id = '1';
      await controller.findOne(id);

      const updateUserDto: UpdateUserDto = { username: 'updated' } as UpdateUserDto;
      await controller.update(id, updateUserDto);

      await controller.remove(id);

      // Correctly check calls in any order:
      const expectedCalls = [
        ['permissions', UsersController.prototype.create],
        ['permissions', UsersController.prototype.findAll],
        ['permissions', UsersController.prototype.findOne],
        ['permissions', UsersController.prototype.update],
        ['permissions', UsersController.prototype.remove],
      ];

      expect((reflector.get as jest.Mock).mock.calls.length).toBe(expectedCalls.length); // Check the number of calls

      expectedCalls.forEach(call => {
        expect(reflector.get).toHaveBeenCalledWith(...call);
      });
    });
  });
});