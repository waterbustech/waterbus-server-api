import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../core';
import { UserService } from './user.service';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';
import { UserController } from './user.controller';
import { TypesenseConfig } from 'src/core/config/typesense/typesense.config';
import { EnvironmentConfigModule } from 'src/core/config/environment/environment.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EnvironmentConfigModule],
  providers: [TypesenseConfig, UserFactoryService, UserService, UserUseCases],
  exports: [UserFactoryService, UserService, UserUseCases],
  controllers: [UserController],
})
export class UserModule {}
