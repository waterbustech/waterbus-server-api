import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from 'src/core/entities/meeting.entity';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import { UsersService } from '../users/users.service';
import { User } from 'src/core';
import { Participant } from 'src/core/entities/participant.entity';
import { Member } from 'src/core/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, User, Participant, Member])],
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    UsersService,
    MeetingsUseCases,
    MeetingFactoryService,
  ],
  exports: [MeetingsService, MeetingsUseCases, MeetingFactoryService],
})
export class MeetingsModule {}
