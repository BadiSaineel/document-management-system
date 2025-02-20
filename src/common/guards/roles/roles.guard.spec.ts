import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, ArgumentsHost } from '@nestjs/common';
import { UsersService } from '../../../users/services/users.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneWithRoleAndPermissios: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no permissions are required', async () => {
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { role: { name: 'someRole' }, permissions: [] } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValue(undefined);
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({ role: { permissions: [] } });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no user', async () => {
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({})),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(usersService.findOneWithRoleAndPermissios).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user.id is missing', async () => {
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: {} })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(usersService.findOneWithRoleAndPermissios).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user has no role', async () => {
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { id: 1 } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user has no permissions', async () => {
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { id: 1 } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({ role: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if required permissions are not present', async () => {
    const requiredPermissions = ['some_permission'];
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { id: 1 } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValue(requiredPermissions);
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({
      role: { permissions: [{ name: 'another_permission' }] },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true if user has required permission', async () => {
    const requiredPermissions = ['some_permission'];
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { id: 1 } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValue(requiredPermissions);
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({
      role: { permissions: [{ name: 'some_permission' }] },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if user has different permission', async () => {
    const requiredPermissions = ['some_permission'];
    const context: ExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: { id: 1 } })),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    (reflector.get as jest.Mock).mockReturnValue(requiredPermissions);
    (usersService.findOneWithRoleAndPermissios as jest.Mock).mockResolvedValue({
      role: { permissions: [{ name: 'another_permission' }] },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});