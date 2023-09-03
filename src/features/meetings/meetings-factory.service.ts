import { Injectable } from '@nestjs/common';
import { CreateMeetingDto, UpdateMeetingDto } from '../../core/dtos';
import { Meeting } from '../../core/entities/meeting.entity';
import { Participant } from 'src/core/entities/participant.entity';

@Injectable()
export class MeetingFactoryService {
  createNewRoom(room: CreateMeetingDto, participant: Participant): Meeting {
    const newRoom = new Meeting();
    newRoom.title = room.title;
    newRoom.password = room.password;

    newRoom.users = [participant];

    return newRoom;
  }

  getRoomFromUpdateDto(room: UpdateMeetingDto): Meeting {
    const newRoom = new Meeting();
    newRoom.title = room.title;
    newRoom.password = room.password;
    newRoom.code = room.code;

    return newRoom;
  }

  getRoomFromJoinDto(code: number, password: string): Meeting {
    const newRoom = new Meeting();
    newRoom.password = password;
    newRoom.code = code;

    return newRoom;
  }
}
