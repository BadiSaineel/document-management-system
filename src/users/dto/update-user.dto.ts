import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'The updated username (optional)' })
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  username?: string;

  @ApiProperty({ description: 'The updated email address (optional)' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiProperty({ description: 'The updated password (optional)' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

}
