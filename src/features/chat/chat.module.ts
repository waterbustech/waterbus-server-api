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
import { CCUService } from '../auth/ccu.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message]),
    MeetingModule,
    ClientProxyModule.register(),
    UserModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [
    {
      provide: ChatGrpcClientService,
      inject: [ClientProxyModule.chatClientProxy, CCUService],
      useFactory: (clientProxy: ClientGrpc, ccuService: CCUService) =>
        new ChatGrpcClientService(clientProxy, ccuService),
    },
    ChatService,
    ChatUseCases,
  ],
  exports: [ChatService, ChatUseCases],
})
export class ChatModule {}
