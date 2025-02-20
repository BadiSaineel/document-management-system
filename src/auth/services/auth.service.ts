import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
      ) {}
    
      async register(userDto: CreateUserDto): Promise<any> {
        try {
          const user = await this.usersService.create(userDto);
          return user;
        } catch (error) {
            throw error;
        }
      }
    
      async login(userDto: any): Promise<{ access_token: string }> {
        const user = await this.usersService.findOneByUsername(userDto.username);
        console.log("user found,", user);
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.id, role: user.role.name };
        return {
          access_token: await this.jwtService.signAsync(payload),
        };
      }
}
