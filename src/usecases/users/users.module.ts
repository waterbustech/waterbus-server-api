import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserFactoryService, UsersService, UserUseCases],
  exports: [UserFactoryService, UsersService, UserUseCases],
  controllers: [UsersController],
})
export class UsersModule {}
