import { Injectable } from '@nestjs/common';
import * as AWS from "aws-sdk";
import { getExtention } from 'src/helper/helper.fuctions';

@Injectable()
export class S3Service {
    private S3BucketName = process.env.AWS_S3_BUCKET_NAME;
    private S3REGION = process.env.AWS_S3_REGION;
    private validExtensions = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.pdf': 'application/pdf',
        '.tiff': 'image/tiff',
      };

    private s3 = new AWS.S3
    ({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    });

    async uploadFile(fileBuffer:Buffer,originalname:string,mimetype:string) {
        return await this.s3_upload(fileBuffer, this.S3BucketName, originalname, mimetype);
    }

    async download(keyName: string) {
        const  base64String = await this.downloadFile(this.S3BucketName, keyName);
        return base64String;
    }

    //#region Private Fuctions
    private async s3_upload(file:Buffer, bucket:string, name:string, mimetype:string) {
        const params =
        {
            Bucket: bucket,
            Key: String(name),
            Body: file,
            ContentType: mimetype,
            ContentDisposition: "inline",
            CreateBucketConfiguration:
            {
                LocationConstraint: this.S3REGION
            }
        };
        try {
            let s3Response = await this.s3.upload(params).promise();
            return s3Response.Key;
        }
        catch (e) {
            return null
        }
    }
    private async  downloadFile(bucketName: string, keyName: string):Promise<string> {
        const params = {
            Bucket: bucketName,
            Key: keyName,
        };

        try {
            const response = await this.s3.getObject(params).promise();
            const base64String = response.Body.toString('base64');
            const extention = getExtention(keyName);
            return `data:${this.validExtensions[`${extention}`]};base64,${base64String}`;
        } catch (error) {
            return null
        }
        
    }
}
