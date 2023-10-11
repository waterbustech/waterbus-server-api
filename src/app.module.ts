import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './core/config/database.config';
import authConfig from './core/config/auth.config';
import appConfig from './core/config/app.config';
import grpcConfig from './core/config/grpc.config';
import { TypeOrmConfigService } from './core/database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { MeetingsModule } from './features/meetings/meetings.module';
import { GrpcModule } from './features/grpc/grpc.module';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { grpcClientOptions } from './grpc.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, grpcConfig],
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
