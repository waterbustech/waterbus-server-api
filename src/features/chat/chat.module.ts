import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatsService as ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Message } from 'src/core/entities/message.entity';
import { ChatUseCases } from './chat.usecase';
import { MeetingModule } from '../meeting/meeting.module';
import { ClientProxyModule } from 'src/core/client-proxy/client-proxy.module';
import { ChatGrpcClientService } from 'src/services/chat.proto.service';
import { ClientGrpc } from '@nestjs/microservices';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message]),
    MeetingModule,
    ClientProxyModule.register(),
    UserModule,
  ],
  controllers: [ChatController],
  providers: [
    {
      provide: ChatGrpcClientService,
      inject: [ClientProxyModule.chatClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new ChatGrpcClientService(clientProxy),
    },
    ChatService,
    ChatUseCases,
  ],
  exports: [ChatService, ChatUseCases],
})
export class ChatModule {}
