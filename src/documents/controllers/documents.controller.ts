import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { DocumentsService } from '../services/documents.service';
import { Request } from 'express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CREATE_DOCUMENT, DELETE_DOCUMENT, VIEW_DOCUMENT } from '../../common/constants/db.constants';

@ApiTags('documents')
@Controller('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Permissions(CREATE_DOCUMENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({summary: 'Upload a document'})
  @ApiBody({
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The document file to upload',
        },
        title: {
          type: 'string',
          description: 'The title of the document',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: /(pdf|docx|odt|jpeg|png|jpg)$/ }), // Allowed file types
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request
  ) {
    const userId = req.user?.id;
    const { title, metadata } = req.body;
    if(userId)
        return this.documentsService.uploadDocument(file, title, metadata, userId);
  }

  @Get()
  @Permissions(VIEW_DOCUMENT)
  async getDocuments(@Req() req: Request) {
    const userId = req.user?.id;
    if(userId){
        return this.documentsService.getDocuments(userId);
    }

  }

  @Get(':id')
  @Permissions(VIEW_DOCUMENT)
  async getDocumentById(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id;
    if(userId){
        return this.documentsService.getDocument(parseInt(id, 10), userId);
    }
    
  }

  @Delete(':id')
  @Permissions(DELETE_DOCUMENT)
  async deleteDocument(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id;
    if(userId){
        return this.documentsService.deleteDocument(parseInt(id, 10), userId);
    }
  }
}
