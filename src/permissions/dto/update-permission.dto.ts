import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({ description: 'The updated name of the permission (optional)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The updated description of the permission (optional)' })
  @IsOptional()
  @IsString()
  description?: string;
}