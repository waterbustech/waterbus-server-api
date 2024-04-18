import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/core/entities/meeting.entity';
import { MeetingUseCases } from './meeting.usecase';
import { MeetingFactoryService } from './meeting-factory.service';
import { User } from 'src/core';
import { Participant } from 'src/core/entities/participant.entity';
import { Member } from 'src/core/entities/member.entity';
import { MeetingGrpcController } from './meeting.proto.controller';
import { UserModule } from '../user/user.module';
import { CCU } from 'src/core/entities/ccu.entity';
import { ParticipantService } from './participant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, User, Participant, Member, CCU]),
    UserModule,
  ],
  controllers: [MeetingController, MeetingGrpcController],
  providers: [
    MeetingService,
    MeetingUseCases,
    MeetingFactoryService,
    ParticipantService,
  ],
  exports: [MeetingService, MeetingUseCases, MeetingFactoryService],
})
export class MeetingModule {}
