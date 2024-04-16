import { Module } from '@nestjs/common';
import { MeetingService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/core/entities/meeting.entity';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import { User } from 'src/core';
import { Participant } from 'src/core/entities/participant.entity';
import { Member } from 'src/core/entities/member.entity';
import { MeetingGrpcController } from './meeting.proto.controller';
import { UsersModule } from '../users/users.module';
import { CCU } from 'src/core/entities/ccu.entity';
import { ParticipantService } from './participant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, User, Participant, Member, CCU]),
    UsersModule,
  ],
  controllers: [MeetingsController, MeetingGrpcController],
  providers: [
    MeetingService,
    MeetingsUseCases,
    MeetingFactoryService,
    ParticipantService,
  ],
  exports: [MeetingService, MeetingsUseCases, MeetingFactoryService],
})
export class MeetingsModule {}
