import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/core/entities/meeting.entity';
import { MeetingUseCases } from './meeting.usecase';
import { MeetingFactoryService } from './meeting-factory.service';
import { Participant } from 'src/core/entities/participant.entity';
import { Member } from 'src/core/entities/member.entity';
import { MeetingGrpcController } from './meeting.proto.controller';
import { UserModule } from '../user/user.module';
import { CCU } from 'src/core/entities/ccu.entity';
import { ParticipantService } from './participant.service';
import { WhiteBoard } from 'src/core/entities/white-board.entity';
import { WhiteBoardService } from './white-board.service';
import { WhiteBoardUseCases } from './white-board.usecase';
import { Record } from 'src/core/entities/record.entity';
import { RecordTrack } from 'src/core/entities/record-track.entity';
import { RecordUseCases } from './record.usecase';
import { RecordService } from './record.service';
import { WhiteBoardGrpcController } from './white-board.proto.controller';
import { ChatGrpcClientService } from 'src/services/chat.proto.service';
import { ClientProxyModule } from 'src/core/client-proxy/client-proxy.module';
import { CCUService } from '../auth/ccu.service';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { RecordGrpcService } from 'src/services/record.proto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      CCU,
      Participant,
      Member,
      WhiteBoard,
      Record,
      RecordTrack,
    ]),
    AuthModule,
    UserModule,
    ClientProxyModule.register(),
  ],
  controllers: [
    MeetingController,
    MeetingGrpcController,
    WhiteBoardGrpcController,
  ],
  providers: [
    MeetingService,
    MeetingUseCases,
    WhiteBoardUseCases,
    RecordUseCases,
    MeetingFactoryService,
    ParticipantService,
    WhiteBoardService,
    RecordService,
    {
      provide: ChatGrpcClientService,
      inject: [ClientProxyModule.chatClientProxy, CCUService],
      useFactory: (clientProxy: ClientGrpc, ccuService: CCUService) =>
        new ChatGrpcClientService(clientProxy, ccuService),
    },
    {
      provide: RecordGrpcService,
      inject: [ClientProxyModule.recordClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new RecordGrpcService(clientProxy),
    },
  ],
  exports: [
    MeetingService,
    MeetingUseCases,
    MeetingFactoryService,
    ChatGrpcClientService,
    RecordUseCases,
    RecordService,
  ],
})
export class MeetingModule {}
