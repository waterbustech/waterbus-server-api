import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentConfigService } from './environments';
import databaseConfig from '../database.config';
import authConfig from '../auth.config';
import appConfig from '../app.config';
import grpcConfig from '../grpc.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, grpcConfig],
      envFilePath: ['.env'],
    }),
  ],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class EnvironmentConfigModule {}
