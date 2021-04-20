import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import PrivateFile from './privateFile.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PrivateFileService {
  constructor(
    @InjectRepository(PrivateFile)
    private privateFileRepository: Repository<PrivateFile>,
    private readonly configureService: ConfigService,
  ) {}

  async uploadPrivateFile(
    dataBuffer: Buffer,
    ownerId: number,
    filename: string,
  ) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configureService.get('AWS_PRIVATE_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();
    const newFile = this.privateFileRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId,
      },
    });
    await this.privateFileRepository.save(newFile);
    return newFile;
  }

  async getPrivateFile(fileId: number) {
    const s3 = new S3();
    const fileInfo = await this.privateFileRepository.findOne(
      { id: fileId },
      { relations: ['owner'] },
    );
    if (fileInfo) {
      const stream = await s3
        .getObject({
          Bucket: this.configureService.get('AWS_PRIVATE_BUCKET_NAME'),
          Key: fileInfo.key,
        })
        .createReadStream();
      return {
        stream,
        info: fileInfo,
      };
    }
    throw new NotFoundException();
  }

  async generatePresignedUrl(key: string) {
    const s3 = new S3();
    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configureService.get('AWS_PRIVATE_BUCKET_NAME'),
      Key: key,
    });
  }
}
