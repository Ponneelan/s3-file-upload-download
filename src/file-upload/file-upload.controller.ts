import { Controller, Post, Res, Req, UseInterceptors, UploadedFile, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { custructFileName } from 'src/helper/helper.fuctions';

@Controller('file-upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3Service: S3Service
  ) { }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    type: 'file',
  })
  @UseInterceptors(FileInterceptor('file'))
  public async upload(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() req: Request) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'invalid input',
        })
      }
      const fileSizeMB = 10;
      const maxFileSize = fileSizeMB * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'file size exceed',
        })
      }

      const supportedTypes = ['png', 'jpg'];
      const fileExtension = file.originalname.split('.').pop();
      if (!supportedTypes.includes(fileExtension)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'file type not supported',
        })
      }
      const fileName:string = custructFileName(file.originalname);
      const response = await this.s3Service.uploadFile(file.buffer, fileName, file.mimetype);
      if (!response) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'something went wrong',
        })
      }
      return res.status(HttpStatus.OK).json({
        status:true,
        message: 'file uploaded',
        fileName: response
      })

    } catch (error) {
      console.error(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status:false,
        message: 'something went wrong',
      })
    }
  }

  @Get('download/:keyName')
  public async download(@Req() req:Request, @Res() res:Response,@Param('keyName') keyName:string){
    try {
      
      if(!keyName){
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'invalid input',
        });
      }
      let response = await this.s3Service.download(keyName);

      if(!response){
        return res.status(HttpStatus.BAD_REQUEST).json({
          status:false,
          message: 'invalid input',
        });
      }

      return res.status(HttpStatus.OK).json({
        status:true,
        message: 'file downloaded',
        fileName: response
      })

    } catch (error) {
      console.error(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status:false,
        message: 'something went wrong',
      });
    }
  }
}

