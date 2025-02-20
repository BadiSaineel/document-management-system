import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiProperty({ description: 'The updated title of the document (optional)' })
  @IsOptional()
  @IsString()
  title?: string;


  @ApiProperty({ description: 'Updated metadata for the document (optional)' })
  @IsOptional()
  metadata?: any;
}