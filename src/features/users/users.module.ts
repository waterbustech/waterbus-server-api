import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../core';
import { UsersService } from './users.service';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserFactoryService, UsersService, UserUseCases],
  exports: [UserFactoryService, UsersService, UserUseCases],
  controllers: [UserController],
})
export class UsersModule {}
