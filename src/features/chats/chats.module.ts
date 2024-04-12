import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Message } from 'src/core/entities/message.entity';
import { ChatsUseCases } from './chats.usecase';
import { MeetingsModule } from '../meetings/meetings.module';
import { ClientProxyModule } from 'src/core/client-proxy/client-proxy.module';
import { ChatGrpcClientService } from 'src/services/chat.proto.service';
import { ClientGrpc } from '@nestjs/microservices';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message]),
    MeetingsModule,
    ClientProxyModule.register(),
    UsersModule,
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
    ChatsUseCases,
  ],
  exports: [ChatsService, ChatsUseCases],
})
export class ChatsModule {}
