import { registerAs } from '@nestjs/config';
import { GRPCUrlConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_GRPC_URL: string;

  @IsString()
  MEETING_GRPC_URL: string;
}

export default registerAs<GRPCUrlConfig>('grpc', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    authUrl: process.env.AUTH_GRPC_URL || 'localhost:50055',
    meetingUrl: process.env.MEETING_GRPC_URL || 'localhost:50056',
  };
});
