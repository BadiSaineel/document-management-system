import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'An array of permission IDs associated with this role' })
  @IsArray()
  permissions: number[];
}