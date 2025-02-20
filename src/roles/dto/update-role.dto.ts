import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ description: 'The updated name of the role (optional)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'An array of permission IDs to update the role with (optional)' })
  @IsOptional()
  @IsArray()
  permissions?: number[];
}