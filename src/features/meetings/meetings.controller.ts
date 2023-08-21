import {
  Controller,
  Get,
  Put,
  Request,
  Body,
  Param,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import {
  CreateMeetingDto,
  JoinMeetingDto,
  LeaveMeetingDto,
  UpdateMeetingDto,
} from '../../core/dtos';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Repository } from 'typeorm';
import { ParticipantRole } from '../../core/enums';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'meetings',
  version: '1',
})
export class MeetingsController {
  constructor(
    private meetingsUseCases: MeetingsUseCases,
    private userService: UsersService,
    private meetingFactoryService: MeetingFactoryService,
    @InjectRepository(Participant)
    private participantsRepository: Repository<Participant>,
  ) {}

  @Get(':code')
  async getRoomByCode(@Param('code') code: number) {
    return this.meetingsUseCases.getRoomByCode(code);
  }

  @Post()
  async createRoom(@Request() request, @Body() createRoom: CreateMeetingDto) {
    const user = await this.userService.findOne({ id: request.user.id });

    let host = new Participant();
    host.user = user;
    host.role = ParticipantRole.Host;

    const participant = await this.participantsRepository.save(
      this.participantsRepository.create(host),
    );

    console.log({ participant });

    const room = this.meetingFactoryService.createNewRoom(
      createRoom,
      participant,
    );

    return this.meetingsUseCases.createRoom(room);
  }

  @Put()
  updateRoom(@Request() request, @Body() updateRoomDto: UpdateMeetingDto) {
    const room = this.meetingFactoryService.getRoomFromUpdateDto(updateRoomDto);

    return this.meetingsUseCases.updateRoom(request.user.id, room);
  }

  @Post(':code')
  async joinRoom(
    @Param('code') code: number,
    @Request() request,
    @Body() joinRoomDto: JoinMeetingDto,
  ) {
    const user = await this.userService.findOne({ id: request.user.id });

    const room = this.meetingFactoryService.getRoomFromJoinDto(
      code,
      joinRoomDto.password,
    );

    let attendee = new Participant();
    attendee.user = user;
    attendee.role = ParticipantRole.Attendee;

    const participant = await this.participantsRepository.save(
      this.participantsRepository.create(attendee),
    );

    return this.meetingsUseCases.joinRoom(room, participant);
  }

  @Delete(':code')
  async leaveRoom(
    @Param('code') code: number,
    @Body() leaveRoomDto: LeaveMeetingDto,
  ) {
    return this.meetingsUseCases.leaveRoom(code, leaveRoomDto.participantId);
  }
}
