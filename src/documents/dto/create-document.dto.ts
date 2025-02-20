import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'The title of the document' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Any metadata associated with the document (optional)' })
  @IsOptional()
  metadata?: any;
}