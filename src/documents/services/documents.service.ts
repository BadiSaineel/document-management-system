import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { StorageService } from 'src/common/storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private storageService: StorageService,
  ) {}

  async uploadDocument(file: Express.Multer.File, title: string, metadata: any, userId: number): Promise<Document> {
    try {
      const path = await this.storageService.upload(file, userId);
      const newDocument = this.documentRepository.create({
        title,
        path,
        metadata,
        user: { id: userId },
      });
      return this.documentRepository.save(newDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return this.documentRepository.find({ where: { user: { id: userId } } });
  }

  async getDocument(id: number, userId: number): Promise<any> {
    const document = await this.documentRepository.findOne({ where: {id, user: {id: userId}} });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    try {
      return await this.storageService.get(document.path);
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  async deleteDocument(id: number, userId: number): Promise<string> {
    const document = await this.documentRepository.findOne({ where: { id, user: { id: userId } }});
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    try {
      await this.storageService.delete(document.path);
      await this.documentRepository.remove(document);
      return "Document deleted successfully";
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
}
