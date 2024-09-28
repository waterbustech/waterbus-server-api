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
    UserModule,
  ],
  controllers: [MeetingController, MeetingGrpcController],
  providers: [
    MeetingService,
    MeetingUseCases,
    WhiteBoardUseCases,
    RecordUseCases,
    MeetingFactoryService,
    ParticipantService,
    WhiteBoardService,
    RecordService,
  ],
  exports: [MeetingService, MeetingUseCases, MeetingFactoryService],
})
export class MeetingModule {}
