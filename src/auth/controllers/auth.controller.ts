import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';
import { Request } from 'express';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    if (req.user) {
      req.user = undefined;
    }
    req.headers.authorization = undefined;
    return { message: 'Logged out successfully' };
  }
}
