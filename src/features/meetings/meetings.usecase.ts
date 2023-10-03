import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Meeting } from 'src/core/entities/meeting.entity';
import bcrypt from 'bcryptjs';
import { Participant } from 'src/core/entities/participant.entity';
import { ParticipantRole, Status } from '../../core/enums';

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
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException('Not found room');

      const indexHost = existsRoom.users.findIndex(
        (user) => user.user.id == userId,
      );

      if (indexHost < 0) throw new NotFoundException('Cannot check permission');

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

  async joinRoom(meeting: Meeting, participant: Participant): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException();

      if (participant.role != ParticipantRole.Host) {
        const isMatchPassword = await bcrypt.compare(
          meeting.password,
          existsRoom.password,
        );

        if (!isMatchPassword) throw new BadRequestException('Wrong password!');
      }

      // Just update if participant already exists in room
      let indexOfParticipant = existsRoom.users.findIndex(
        (mParticipant) => mParticipant.id == participant.id,
      );
      if (indexOfParticipant != -1) {
        existsRoom.users[indexOfParticipant] = participant;
      } else {
        existsRoom.users.push(participant);
      }

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async leaveRoom(code: number, participantId: number): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);

      if (!existsRoom) return;

      let indexOfParticipant = existsRoom.users.findIndex(
        (participant) => participant.id == participantId,
      );

      if (indexOfParticipant == -1) return;

      existsRoom.users[indexOfParticipant].status = Status.Inactive;

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
