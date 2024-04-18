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
import { MeetingUseCases } from './meeting.usecase';
import { MeetingFactoryService } from './meeting-factory.service';
import {
  CreateMeetingDto,
  JoinMeetingDto,
  UpdateMeetingDto,
  AddUserDto,
  PaginationListQuery,
} from '../../core/dtos';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Repository } from 'typeorm';
import { Member } from '../../core/entities/member.entity';
import { MemberRole, MemberStatus } from '../../core/enums/member';
import { UserUseCases } from '../user/user.usecase';

@ApiBearerAuth()
@ApiSecurity('api_key', ['api_key'])
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'meetings',
  version: '1',
})
export class MeetingController {
  constructor(
    private meetingUseCases: MeetingUseCases,
    private userUseCases: UserUseCases,
    private meetingFactoryService: MeetingFactoryService,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  @Get(':code')
  async getRoomByCode(@Param('code') code: number) {
    return this.meetingUseCases.getRoomByCode(code);
  }

  @Get('/conversations/:status')
  async getRoomsByAuth(
    @Request() request,
    @Param('status') status: MemberStatus,
    @Query() query: PaginationListQuery,
  ) {
    return this.meetingUseCases.getRoomsByUserId({
      userId: request.user.id,
      status,
      query,
    });
  }

  @Post()
  async createRoom(@Request() request, @Body() createRoom: CreateMeetingDto) {
    const user = await this.userUseCases.getUserById(request.user.id);

    const member = new Member();
    member.user = user;
    member.role = MemberRole.Host;
    member.status = MemberStatus.Joined;

    const memberSaved = await this.memberRepository.save(
      this.memberRepository.create(member),
    );

    const room = this.meetingFactoryService.createNewRoom({
      room: createRoom,
      member: memberSaved,
    });

    return this.meetingUseCases.createRoom(room);
  }

  @Put()
  updateRoom(@Request() request, @Body() updateRoomDto: UpdateMeetingDto) {
    const room = this.meetingFactoryService.getRoomFromUpdateDto(updateRoomDto);

    return this.meetingUseCases.updateRoom(request.user.id, room);
  }

  @Post('/members/:code')
  async addRoomMember(
    @Request() request,
    @Param('code') code: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return this.meetingUseCases.addRoomMember({
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
    return this.meetingUseCases.removeRoomMember({
      code: code,
      hostId: request.user.id,
      userId: addUserDto.userId,
    });
  }

  @Post('/members/accept/:code')
  async acceptRoomInvitation(@Request() request, @Param('code') code: number) {
    return this.meetingUseCases.acceptRoomInvitation({
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
    const user = await this.userUseCases.getUserById(request.user.id);

    const room = this.meetingFactoryService.getRoomFromJoinDto(
      code,
      joinRoomDto.password,
    );

    const attendee = new Participant();
    attendee.user = user;

    const participant = await this.participantRepository.save(
      this.participantRepository.create(attendee),
    );

    return this.meetingUseCases.joinRoomWithPassword(room, participant);
  }

  @Post('/join/:code')
  async joinRoomForMember(@Param('code') code: number, @Request() request) {
    const user = await this.userUseCases.getUserById(request.user.id);

    const room = await this.meetingUseCases.getRoomByCode(code);

    const attendee = new Participant();
    attendee.user = user;

    const participant = await this.participantRepository.save(
      this.participantRepository.create(attendee),
    );

    return this.meetingUseCases.joinRoomForMember(room, participant, user.id);
  }

  @Delete(':code')
  async leaveRoom(@Request() request, @Param('code') code: number) {
    const userId = request.user.id;
    return this.meetingUseCases.leaveRoom({ code, userId });
  }
}
