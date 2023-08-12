import {
  Controller,
  Get,
  Put,
  Request,
  Body,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import { CreateMeetingDto, UpdateMeetingDto } from '../../core/dtos';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  ) {}

  @Get(':code')
  async getRoomByCode(@Param('code') code: number) {
    return this.meetingsUseCases.getRoomByCode(code);
  }

  @Post()
  async createRoom(@Request() request, @Body() createRoom: CreateMeetingDto) {
    const user = await this.userService.findOne({ id: request.user.id });

    const room = this.meetingFactoryService.createNewRoom(createRoom, user);

    return this.meetingsUseCases.createRoom(room);
  }

  @Put()
  updateRoom(@Request() request, @Body() updateRoomDto: UpdateMeetingDto) {
    const room = this.meetingFactoryService.getRoomFromUpdateDto(updateRoomDto);

    return this.meetingsUseCases.updateRoom(request.user.id, room);
  }
}
