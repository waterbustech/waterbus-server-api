import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../core';
import { UsersService } from './users.service';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';
import { UserController } from './user.controller';
import { TypesenseConfig } from 'src/core/config/typesense/typesense.config';
import { CCU } from 'src/core/entities/ccu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TypesenseConfig, UserFactoryService, UsersService, UserUseCases],
  exports: [UserFactoryService, UsersService, UserUseCases],
  controllers: [UserController],
})
export class UsersModule {}
