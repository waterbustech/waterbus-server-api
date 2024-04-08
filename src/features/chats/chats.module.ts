import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Message } from 'src/core/entities/message.entity';
import { ChatsUseCases } from './chats.usecase';
import { UsersService } from '../users/users.service';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message]), MeetingsModule],
  controllers: [ChatsController],
  providers: [ChatsService, UsersService, ChatsUseCases],
  exports: [ChatsService, ChatsUseCases],
})
export class ChatsModule {}
