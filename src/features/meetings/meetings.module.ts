import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, User, Participant, Member]),
    UsersModule,
  ],
  controllers: [MeetingsController, MeetingGrpcController],
  providers: [MeetingsService, MeetingsUseCases, MeetingFactoryService],
  exports: [MeetingsService, MeetingsUseCases, MeetingFactoryService],
})
export class MeetingsModule {}
