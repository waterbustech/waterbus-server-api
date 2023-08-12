import { Injectable } from '@nestjs/common';
import { CreateMeetingDto, UpdateMeetingDto } from '../../core/dtos';
import { Meeting } from '../../core/entities/meeting.entity';
import { User } from 'src/core';

@Injectable()
export class MeetingFactoryService {
  createNewRoom(room: CreateMeetingDto, createdBy: User): Meeting {
    const newRoom = new Meeting();
    newRoom.title = room.title;
    newRoom.password = room.password;
    newRoom.createdBy = createdBy;

    return newRoom;
  }

  getRoomFromUpdateDto(room: UpdateMeetingDto): Meeting {
    const newRoom = new Meeting();
    newRoom.title = room.title;
    newRoom.password = room.password;
    newRoom.code = room.code;

    return newRoom;
  }
}
