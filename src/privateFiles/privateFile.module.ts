import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import PrivateFile from './privateFile.entity';
import { PrivateFileService } from './privateFile.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrivateFile]), ConfigModule],
  providers: [PrivateFileService],
  exports: [PrivateFileService],
})
export class PrivateFileModule {}
