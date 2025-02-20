import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The name of the permission (e.g., documents.create)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'A description of the permission (optional)' })
  @IsOptional()
  @IsString()
  description?: string;
}