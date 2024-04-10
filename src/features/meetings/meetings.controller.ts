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
  Query,
} from '@nestjs/common';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import {
  CreateMeetingDto,
  JoinMeetingDto,
  UpdateMeetingDto,
  AddUserDto,
  PaginationListQuery,
} from '../../core/dtos';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Repository } from 'typeorm';
import { Member } from '../../core/entities/member.entity';
import { MemberRole, MemberStatus } from '../../core/enums/member';

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
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    @InjectRepository(Participant)
    private participantsRepository: Repository<Participant>,
  ) {}

  @Get(':code')
  async getRoomByCode(@Param('code') code: number) {
    return this.meetingsUseCases.getRoomByCode(code);
  }

  @Get('/conversations/:status')
  async getRoomsByAuth(
    @Request() request,
    @Param('status') status: MemberStatus,
    @Query() query: PaginationListQuery,
  ) {
    return this.meetingsUseCases.getRoomsByUserId({
      userId: request.user.id,
      status,
      query,
    });
  }

  @Post()
  async createRoom(@Request() request, @Body() createRoom: CreateMeetingDto) {
    const user = await this.userService.findOne({ id: request.user.id });

    const member = new Member();
    member.user = user;
    member.role = MemberRole.Host;
    member.status = MemberStatus.Joined;

    const memberSaved = await this.membersRepository.save(
      this.membersRepository.create(member),
    );

    const room = this.meetingFactoryService.createNewRoom({
      room: createRoom,
      member: memberSaved,
    });

    return this.meetingsUseCases.createRoom(room);
  }

  @Put()
  updateRoom(@Request() request, @Body() updateRoomDto: UpdateMeetingDto) {
    const room = this.meetingFactoryService.getRoomFromUpdateDto(updateRoomDto);

    return this.meetingsUseCases.updateRoom(request.user.id, room);
  }

  @Post('/members/:code')
  async addRoomMember(
    @Request() request,
    @Param('code') code: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return this.meetingsUseCases.addRoomMember({
      code: code,
      hostId: request.user.id,
      userId: addUserDto.userId,
    });
  }

  @Delete('/members/:code')
  async removeRoomMember(
    @Request() request,
    @Param('code') code: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return this.meetingsUseCases.removeRoomMember({
      code: code,
      hostId: request.user.id,
      userId: addUserDto.userId,
    });
  }

  @Post('/members/accept/:code')
  async acceptRoomInvitation(@Request() request, @Param('code') code: number) {
    return this.meetingsUseCases.acceptRoomInvitation({
      code: code,
      userId: request.user.id,
    });
  }

  // Using for stranger join by code & password
  @Post('/join/password/:code')
  async joinRoomForStranger(
    @Param('code') code: number,
    @Request() request,
    @Body() joinRoomDto: JoinMeetingDto,
  ) {
    const user = await this.userService.findOne({ id: request.user.id });

    const room = this.meetingFactoryService.getRoomFromJoinDto(
      code,
      joinRoomDto.password,
    );

    const attendee = new Participant();
    attendee.user = user;

    const participant = await this.participantsRepository.save(
      this.participantsRepository.create(attendee),
    );

    return this.meetingsUseCases.joinRoomWithPassword(
      room,
      participant,
      user.id,
    );
  }

  @Post('/join/:code')
  async joinRoomForMember(@Param('code') code: number, @Request() request) {
    const user = await this.userService.findOne({ id: request.user.id });

    const room = await this.meetingsUseCases.getRoomByCode(code);

    const attendee = new Participant();
    attendee.user = user;

    const participant = await this.participantsRepository.save(
      this.participantsRepository.create(attendee),
    );

    return this.meetingsUseCases.joinRoomForMember(room, participant, user.id);
  }

  @Delete(':code')
  async leaveRoom(@Request() request, @Param('code') code: number) {
    const userId = request.user.id;
    return this.meetingsUseCases.leaveRoom({ code, userId });
  }

  // @Get('/participants/:participantId')
  // async getParticipantById(@Param('participantId') participantId: number) {
  //   const participant = await this.participantsRepository.findOne({
  //     where: {
  //       id: participantId,
  //     },
  //   });

  //   if (!participant) throw new NotFoundException('Not exists participant');

  //   return { participant };
  // }
}
