import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

describe('StorageService', () => {
  let service: StorageService;
  let s3Mock: jest.Mocked<S3Client>;

  beforeEach(async () => {
    process.env.AWS_ACCESS_KEY_ID = 'test_access_key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test_secret_key';
    process.env.AWS_REGION = 'test_region';
    process.env.AWS_BUCKET_NAME = 'test_bucket';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
    s3Mock = new S3Client({}) as jest.Mocked<S3Client>;
    (S3Client as jest.Mock).mockImplementation(() => s3Mock);
  });

  describe('upload', () => {
    it('should upload and return URL', async () => {
      const mockFile = { buffer: Buffer.from('test'), originalname: 'test.txt', mimetype: 'text/plain' } as Express.Multer.File;
      const userId = 123;
      const expectedUrl = `https://test_bucket.s3.test_region.amazonaws.com/${userId}/${Date.now()}-${mockFile.originalname}`;

      s3Mock.send.mockResolvedValue({} as never);

      const url = await service.upload(mockFile, userId);

      expect(s3Mock.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(url).toContain(expectedUrl.slice(0, expectedUrl.indexOf('123/')));
    });

    it('should handle upload error', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const userId = 123;
      const error = new Error('Upload failed');

      s3Mock.send.mockRejectedValue(error as never);

      await expect(service.upload(mockFile, userId)).rejects.toThrow(error);
    });
  });

  describe('get', () => {
    it('should get file and return buffer', async () => {
        const mockBuffer = Buffer.from('file content');
        const mockPath = '123/1678886912345-test.txt';

        const mockBody = {
            async *[Symbol.asyncIterator]() {
                yield mockBuffer;
            },
        } as unknown as AsyncIterable<Uint8Array>;

        s3Mock.send.mockResolvedValue({ Body: mockBody } as never);

        const result = await service.get(mockPath);

        expect(s3Mock.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
        expect(result).toEqual(mockBuffer);
    });

    it('should handle get error', async () => {
      const mockPath = 'path/to/file';
      const error = new Error('Get failed');

      s3Mock.send.mockRejectedValue(error as never);

      await expect(service.get(mockPath)).rejects.toThrow(error);
    });

    it('should handle get when Body is undefined', async () => {
      const mockPath = 'path/to/file';

      s3Mock.send.mockResolvedValue({} as never);

      const result = await service.get(mockPath);

      expect(s3Mock.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      expect(result).toEqual(Buffer.from(''));
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      const mockPath = 'path/to/file';

      s3Mock.send.mockResolvedValue({} as never);

      await service.delete(mockPath);

      expect(s3Mock.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('should handle delete error', async () => {
      const mockPath = 'path/to/file';
      const error = new Error('Delete failed');

      s3Mock.send.mockRejectedValue(error as never);

      await expect(service.delete(mockPath)).rejects.toThrow(error);
    });
  });

  describe('constructor', () => {
    it('should throw an error if AWS_ACCESS_KEY_ID is not defined', () => {
      delete process.env.AWS_ACCESS_KEY_ID;
      expect(() => new StorageService()).toThrowError('AWS_ACCESS_KEY_ID environment variable is not defined.');
    });
  });
});