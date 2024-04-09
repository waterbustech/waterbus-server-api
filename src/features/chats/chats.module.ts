import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Message } from 'src/core/entities/message.entity';
import { ChatsUseCases } from './chats.usecase';
import { UsersService } from '../users/users.service';
import { MeetingsModule } from '../meetings/meetings.module';
import { ClientProxyModule } from 'src/core/client-proxy/client-proxy.module';
import { ChatGrpcClientService } from 'src/services/chat.proto.service';
import { ClientGrpc } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message]),
    MeetingsModule,
    ClientProxyModule.register(),
  ],
  controllers: [ChatsController],
  providers: [
    {
      provide: ChatGrpcClientService,
      inject: [ClientProxyModule.chatClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new ChatGrpcClientService(clientProxy),
    },
    ChatsService,
    UsersService,
    ChatsUseCases,
  ],
  exports: [ChatsService, ChatsUseCases],
})
export class ChatsModule {}
