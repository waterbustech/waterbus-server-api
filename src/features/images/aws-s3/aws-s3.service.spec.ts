import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from './aws-s3.service';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

class MockS3 {
  public getSignedUrlPromise(operation: string, params: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (operation === 'putObject' && params) {
        resolve('mock-presigned-url');
      } else {
        reject(new Error('Invalid operation or params'));
      }
    });
  }
}

describe('AwsS3Service', () => {
  let awsS3Service: AwsS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3Service,
        {
          provide: AWS.S3,
          useClass: MockS3,
        },
      ],
    }).compile();

    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL', async () => {
      const mockPresignedUrl = 'mock-presigned-url';
      const mockContentType = 'image/png';

      // Override the getSignedUrlPromise method
      jest
        .spyOn(awsS3Service, 'generatePresignedUrl')
        .mockImplementation(async () => {
          return { presignedUrl: mockPresignedUrl };
        });

      const result = await awsS3Service.generatePresignedUrl(mockContentType);

      expect(result).toEqual({ presignedUrl: mockPresignedUrl });
    });
  });
});
