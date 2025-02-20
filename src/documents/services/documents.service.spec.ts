import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { StorageService } from 'src/common/storage/storage.service';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepository: Repository<Document>;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn(),
            get: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Document),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload document and save to repository', async () => {
      const mockFile = { buffer: Buffer.from('test'), originalname: 'test.txt', mimetype: 'text/plain' } as Express.Multer.File;
      const mockTitle = 'Test Document';
      const mockMetadata = { key: 'value' };
      const mockUserId = 123;
      const mockPath = 'path/to/file';
      const mockDocument = { title: mockTitle, path: mockPath, metadata: mockMetadata, user: { id: mockUserId }, createdAt: new Date(), updatedAt: new Date() } as Document;

      (storageService.upload as jest.Mock).mockResolvedValue(mockPath);
      (documentRepository.create as jest.Mock).mockReturnValue(mockDocument);
      (documentRepository.save as jest.Mock).mockResolvedValue(mockDocument);

      const result = await service.uploadDocument(mockFile, mockTitle, mockMetadata, mockUserId);

      expect(storageService.upload).toHaveBeenCalledWith(mockFile, mockUserId);
      expect(documentRepository.create).toHaveBeenCalledWith({ title: mockTitle, path: mockPath, metadata: mockMetadata, user: { id: mockUserId } });
      expect(documentRepository.save).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });

    it('should re-throw error from storageService.upload', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockTitle = 'Test Document';
      const mockMetadata = { key: 'value' };
      const mockUserId = 123;
      const error = new Error('Upload failed');

      (storageService.upload as jest.Mock).mockRejectedValue(error);

      await expect(service.uploadDocument(mockFile, mockTitle, mockMetadata, mockUserId)).rejects.toThrow(error);
    });
  });

  describe('getDocuments', () => {
    it('should return documents for the given userId', async () => {
      const mockUserId = 123;
      const mockDocuments = [{ id: 1, user: { id: mockUserId }, createdAt: new Date(), updatedAt: new Date() }] as Document[];

      (documentRepository.find as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await service.getDocuments(mockUserId);

      expect(documentRepository.find).toHaveBeenCalledWith({ where: { user: { id: mockUserId } } });
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getDocument', () => {
    it('should return document buffer from storage service', async () => {
      const mockDocument = { id: 1, path: 'path/to/file', user: { id: 123 }, createdAt: new Date(), updatedAt: new Date() } as Document;
      const mockBuffer = Buffer.from('file content');

      (documentRepository.findOne as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.get as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.getDocument(1, 123);

      expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, user: { id: 123 } } });
      expect(storageService.get).toHaveBeenCalledWith(mockDocument.path);
      expect(result).toEqual(mockBuffer);
    });

    it('should throw NotFoundException if document is not found', async () => {
      (documentRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getDocument(1, 123)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw error from storageService.get', async () => {
      const mockDocument = { id: 1, path: 'path/to/file', user: { id: 123 } } as Document;
      const error = new Error('Get failed');

      (documentRepository.findOne as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.get as jest.Mock).mockRejectedValue(error);

      await expect(service.getDocument(1, 123)).rejects.toThrow(error);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from storage and repository', async () => {
      const mockDocument = { id: 1, path: 'path/to/file', user: { id: 123 } } as Document;

      (documentRepository.findOne as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.delete as jest.Mock).mockResolvedValue({});
      (documentRepository.remove as jest.Mock).mockResolvedValue({});

      const result = await service.deleteDocument(1, 123);

      expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, user: { id: 123 } } });
      expect(storageService.delete).toHaveBeenCalledWith(mockDocument.path);
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual('Document deleted successfully');
    });

    it('should throw NotFoundException if document is not found', async () => {
      (documentRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.deleteDocument(1, 123)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw error from storageService.delete', async () => {
      const mockDocument = { id: 1, path: 'path/to/file', user: { id: 123 } } as Document;
      const error = new Error('Delete failed');

      (documentRepository.findOne as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteDocument(1, 123)).rejects.toThrow(error);
    });
  });
});