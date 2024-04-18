import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsS3Service {
  private s3: AWS.S3;

  constructor() {
    // Initialize AWS S3 client with access credentials and region
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async generatePresignedUrl(contentType: string) {
    const Key = `${uuidv4()}.${contentType.split('/')[1]}`;

    // Define parameters for generating a presigned URL
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      Expires: 60,
      ContentType: contentType || 'image/jpeg',
      ACL: 'public-read',
    };

    const presignedUrl = await this.s3.getSignedUrlPromise(
      'putObject',
      s3Params,
    );

    return { presignedUrl };
  }
}
