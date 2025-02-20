import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private s3: S3Client;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!accessKeyId) {
      throw new Error('AWS_ACCESS_KEY_ID environment variable is not defined.');
    }
    if (!secretAccessKey) {
      throw new Error('AWS_SECRET_ACCESS_KEY environment variable is not defined.');
    }
    if (!region) {
      throw new Error('AWS_REGION environment variable is not defined.');
    }
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME environment variable is not defined.');
    }


    this.s3 = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }


  async upload(file: Express.Multer.File, userId: number): Promise<string> {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const key = `${userId}/${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3.send(command);
      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading to S3 in StorageService:", error);
      throw error;
    }
  }

  async get(path: string): Promise<any> { 
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME environment variable is not defined.');
    }

    const key = path.split('/').slice(-2).join('/');

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const command = new GetObjectCommand(params);
      const data = await this.s3.send(command);

      const chunks: any = [];
      if(data.Body){
        const body = data.Body as AsyncIterable<Uint8Array>;
        for await (const chunk of body) {
            chunks.push(chunk);
          }
      }
      const buffer = Buffer.concat(chunks);
      return buffer;
    } catch (error) {
      console.error("Error getting from S3 in StorageService:", error);
      throw error;
    }
  }
  

  async delete(path: string): Promise<void> {
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME environment variable is not defined.');
    }
    const key = path.split('/').slice(-2).join('/');
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
    } catch (error) {
      console.error("Error deleting from S3 in StorageService:", error);
      throw error;
    }
  }
}