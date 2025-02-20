import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { Request } from 'express';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the provided DTO', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
      };
      (authService.register as jest.Mock).mockResolvedValue(createUserDto);

      await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with the user from the request', async () => {
      const loginUserDto: LoginUserDto = { username: "test", password: "password"};
      const user = { id: 1, username: 'testuser' };
      const req = { user } as Request;

      (authService.login as jest.Mock).mockResolvedValue(user);

      await controller.login(loginUserDto, req);

      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('logout', () => {
    it('should clear the user and authorization header from the request', async () => {
      const req = {
        user: { id: 1 },
        headers: { authorization: 'Bearer token' },
      } as Request;

      const result = await controller.logout(req);

      expect(req.user).toBeUndefined();
      expect(req.headers.authorization).toBeUndefined();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });


  describe('Guards', () => {
    it('should use LocalAuthGuard for login', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.login);
      expect(guards).toContain(LocalAuthGuard);
    });
  });
});