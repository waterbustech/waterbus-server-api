import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../core';
import { UsersService } from './users.service';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserFactoryService, UsersService, UserUseCases],
  exports: [UserFactoryService, UsersService, UserUseCases],
})
export class UsersModule {}
