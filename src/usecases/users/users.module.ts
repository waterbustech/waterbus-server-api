import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserFactoryService } from './user-factory.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserFactoryService, UsersService],
  exports: [UserFactoryService, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
