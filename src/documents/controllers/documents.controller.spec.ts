import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from '../services/documents.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { Reflector } from '@nestjs/core';
import {
  CREATE_DOCUMENT,
  DELETE_DOCUMENT,
  VIEW_DOCUMENT,
} from '../../common/constants/db.constants';
import { MaxFileSizeValidator, FileTypeValidator, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../common/storage/storage.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;
  let reflector: Reflector;
  let storageService : StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: {
            uploadDocument: jest.fn(),
            getDocuments: jest.fn(),
            getDocument: jest.fn(),
            deleteDocument: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
            get: jest.fn()
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    reflector = module.get<Reflector>(Reflector);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should call documentsService.uploadDocument with file, title, metadata, and userId', async () => {
      const mockFile = { buffer: Buffer.from('test'), originalname: 'test.txt', mimetype: 'text/plain' } as Express.Multer.File;
      const mockTitle = 'Test Document';
      const mockMetadata = { key: 'value' };
      const mockUser = { id: 123 };
      const mockReq = { user: mockUser, body: { title: mockTitle, metadata: mockMetadata } } as any;

      await controller.uploadDocument(mockFile, mockReq);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockFile, mockTitle, mockMetadata, mockUser.id);
    });

    it('should not call the service if the user is not defined', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockReq = {} as any;

      await controller.uploadDocument(mockFile, mockReq);

      expect(service.uploadDocument).not.toHaveBeenCalled();
    });

    it('should use ParseFilePipe for file upload', () => {
      const validators = Reflect.getMetadata('__paramtype__', DocumentsController.prototype.uploadDocument, "0");
      expect(validators).toContain(ParseFilePipe);
    });

    it('should use FileInterceptor', () => {
      const interceptors = Reflect.getMetadata('__interceptors__', DocumentsController.prototype.uploadDocument);
      expect(interceptors).toContain(FileInterceptor);
    });
  });

  describe('getDocuments', () => {
    it('should call documentsService.getDocuments with userId', async () => {
      const mockUser = { id: 123 };
      const mockReq = { user: mockUser } as any;

      await controller.getDocuments(mockReq);

      expect(service.getDocuments).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not call the service if the user is not defined', async () => {
      const mockReq = {} as any;

      await controller.getDocuments(mockReq);

      expect(service.getDocuments).not.toHaveBeenCalled();
    });
  });

  describe('getDocumentById', () => {
    it('should call documentsService.getDocument with ID and userId', async () => {
      const id = '1';
      const mockUser = { id: 123 };
      const mockReq = { user: mockUser } as any;

      await controller.getDocumentById(id, mockReq);

      expect(service.getDocument).toHaveBeenCalledWith(parseInt(id, 10), mockUser.id);
    });

    it('should not call the service if the user is not defined', async () => {
      const id = '1';
      const mockReq = {} as any;

      await controller.getDocumentById(id, mockReq);

      expect(service.getDocument).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('should call documentsService.deleteDocument with ID and userId', async () => {
      const id = '1';
      const mockUser = { id: 123 };
      const mockReq = { user: mockUser } as any;

      await controller.deleteDocument(id, mockReq);

      expect(service.deleteDocument).toHaveBeenCalledWith(parseInt(id, 10), mockUser.id);
    });

    it('should not call the service if the user is not defined', async () => {
      const id = '1';
      const mockReq = {} as any;

      await controller.deleteDocument(id, mockReq);

      expect(service.deleteDocument).not.toHaveBeenCalled();
    });
  });

  describe('Guards and Decorators', () => {
    it('should use JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', DocumentsController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('should have correct permissions for uploadDocument', () => {
      expect(reflector.get).toHaveBeenCalledWith('permissions', DocumentsController.prototype.uploadDocument);
      expect((reflector.get as jest.Mock).mock.calls[0][1]).toEqual(DocumentsController.prototype.uploadDocument);
      expect((reflector.get as jest.Mock).mock.calls[0][0]).toEqual('permissions');
    });

    it('should have correct permissions for getDocuments', () => {
      expect(reflector.get).toHaveBeenCalledWith('permissions', DocumentsController.prototype.getDocuments);
      expect((reflector.get as jest.Mock).mock.calls[1][1]).toEqual(DocumentsController.prototype.getDocuments);
      expect((reflector.get as jest.Mock).mock.calls[1][0]).toEqual('permissions');
    });

    it('should have correct permissions for getDocumentById', () => {
      expect(reflector.get).toHaveBeenCalledWith('permissions', DocumentsController.prototype.getDocumentById);
      expect((reflector.get as jest.Mock).mock.calls[2][1]).toEqual(DocumentsController.prototype.getDocumentById);
      expect((reflector.get as jest.Mock).mock.calls[2][0]).toEqual('permissions');
    });

    it('should have correct permissions for deleteDocument', () => {
      expect(reflector.get).toHaveBeenCalledWith('permissions', DocumentsController.prototype.deleteDocument);
      expect((reflector.get as jest.Mock).mock.calls[3][1]).toEqual(DocumentsController.prototype.deleteDocument);
      expect((reflector.get as jest.Mock).mock.calls[3][0]).toEqual('permissions');
    });
  });
});