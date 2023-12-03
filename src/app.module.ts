import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileUploadModule } from './file-upload/file-upload.module';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [FileUploadModule],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
