import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOneByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should call usersService.create with the provided DTO', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      const createdUser = { id: 1, username: 'testuser', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };

      (usersService.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should re-throw any error from usersService.create', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      };
      const error = new Error('Some error');

      (usersService.create as jest.Mock).mockRejectedValue(error);
      await expect(service.register(createUserDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should return an access token upon successful login', async () => {
      const userDto = { username: 'testuser', password: 'password' };
      const user = { id: 1, username: 'testuser', role: { name: 'testRole' } };
      const accessToken = 'mockAccessToken';

      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(user);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(accessToken);

      const result = await service.login(userDto);

      expect(usersService.findOneByUsername).toHaveBeenCalledWith(userDto.username);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role.name,
      });
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const userDto = { username: 'testuser', password: 'password' };

      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(null);

      await expect(service.login(userDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});