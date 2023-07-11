import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities';
import { MeetingsService } from './meetings.service';
import { Meeting } from 'src/core/entities/meeting.entity';

@Injectable()
export class MeetingsUseCases {
  constructor(private meetingServices: MeetingsService) {}

  async getRoomByCode(roomCode: number): Promise<Meeting> {
    try {
      const roomInfo = await this.meetingServices.findOne({
        code: roomCode,
      });

      return roomInfo;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(meeting: Meeting): Promise<Meeting> {
    try {
      const createdRoom = await this.meetingServices.create(meeting);

      return createdRoom;
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(userId: number, meeting: Meeting): Promise<Meeting> {
    try {
      let existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom || existsRoom.createdBy.id != userId) return;

      existsRoom.title = meeting.title;
      existsRoom.password = meeting.password;

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }
}
