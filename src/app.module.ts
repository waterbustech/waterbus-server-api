import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './core/config/database.config';
import authConfig from './core/config/auth.config';
import appConfig from './core/config/app.config';
import { TypeOrmConfigService } from './core/database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { MeetingsModule } from './features/meetings/meetings.module';
import { GrpcModule } from './features/grpc/grpc.module';
import {
  GrpcReflectionModule,
  addReflectionToGrpcConfig,
} from 'nestjs-grpc-reflection';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { grpcClientOptions } from './grpc.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    GrpcReflectionModule.register(grpcClientOptions),
    AuthModule,
    UsersModule,
    MeetingsModule,
    GrpcModule,
  ],
})
export class AppModule {}
