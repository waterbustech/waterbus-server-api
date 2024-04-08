import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Meeting } from 'src/core/entities/meeting.entity';
import bcrypt from 'bcryptjs';
import { Participant } from '../../core/entities/participant.entity';
import { Status } from '../../core/enums';
import { MemberRole } from '../../core/enums/member';
import { UsersService } from '../users/users.service';
import { Member } from '../../core/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingsUseCases {
  constructor(
    private meetingServices: MeetingsService,
    private userService: UsersService,
    @InjectRepository(Participant)
    private participantsRepository: Repository<Participant>,
  ) {}

  async getRoomByCode(roomCode: number): Promise<Meeting> {
    try {
      const roomInfo = await this.meetingServices.findOne({
        code: roomCode,
      });

      if (!roomInfo) throw new NotFoundException('Room Not Found');

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

      const indexHost = existsRoom.participants.findIndex(
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

  async joinRoomWithPassword(
    meeting: Meeting,
    participant: Participant,
    userId: number,
  ): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException('Room not exists');

      const isMatchPassword = await bcrypt.compare(
        meeting.password,
        existsRoom.password,
      );

      if (!isMatchPassword) throw new BadRequestException('Wrong password!');

      // Just update if participant already exists in room
      let indexOfParticipant = existsRoom.participants.findIndex(
        (mParticipant) => mParticipant.id == participant.id,
      );

      if (indexOfParticipant != -1) {
        existsRoom.participants[indexOfParticipant] = participant;
      } else {
        existsRoom.participants.push(participant);
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

  async joinRoomForMember(
    meeting: Meeting,
    participant: Participant,
    userId: number,
  ): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException('Room not exists');

      let indexOfMember = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1)
        throw new ForbiddenException('User not allow to join directly');

      // Just update if participant already exists in room
      let indexOfParticipant = existsRoom.participants.findIndex(
        (mParticipant) => mParticipant.id == participant.id,
      );

      if (indexOfParticipant != -1) {
        existsRoom.participants[indexOfParticipant] = participant;
      } else {
        existsRoom.participants.push(participant);
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

  async addUser({
    code,
    hostId,
    userId,
  }: {
    code: number;
    hostId: number;
    userId: number;
  }) {
    const existsRoom = await this.getRoomByCode(code);

    if (!existsRoom) throw new NotFoundException('Room not exists');

    const indexOfUser = existsRoom.members.findIndex(
      (member) => member.user.id == userId,
    );

    if (indexOfUser != -1)
      throw new BadRequestException('User already in room');

    const indexOfHost = existsRoom.members.findIndex(
      (member) => member.user.id == hostId,
    );

    if (indexOfHost == -1) throw new NotFoundException('Host not found');

    let host = existsRoom.members[indexOfHost];

    if (host.role != MemberRole.Host)
      throw new ForbiddenException('You not allow to add user');

    const user = await this.userService.findOne({ id: userId });

    if (!user) throw new NotFoundException('User not found');

    let member = new Member();
    member.user = user;

    existsRoom.members.push(member);

    const updatedRoom = await this.meetingServices.update(
      existsRoom.id,
      existsRoom,
    );

    return updatedRoom;
  }

  async removeUser({
    code,
    hostId,
    userId,
  }: {
    code: number;
    hostId: number;
    userId: number;
  }) {
    const existsRoom = await this.getRoomByCode(code);

    if (!existsRoom) throw new NotFoundException('Room not exists');

    const indexOfUser = existsRoom.members.findIndex(
      (member) => member.user.id == userId,
    );

    if (indexOfUser == -1) throw new NotFoundException('User not found');

    const indexOfHost = existsRoom.members.findIndex(
      (member) => member.user.id == hostId,
    );

    if (indexOfHost == -1) throw new NotFoundException('Host not found');

    existsRoom.members = existsRoom.members.filter(
      (member) => member.user.id != userId,
    );

    const updatedRoom = await this.meetingServices.update(
      existsRoom.id,
      existsRoom,
    );

    return updatedRoom;
  }

  async leaveRoom({
    code,
    userId,
  }: {
    code: number;
    userId: number;
  }): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);

      if (!existsRoom) throw new NotFoundException('Room Not Found');

      let indexOfMember = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1) throw new NotFoundException('Member Not Found');

      if (existsRoom.members[indexOfMember].role == MemberRole.Host) {
        throw new ForbiddenException(
          'Host not allowed to leave the room. You can archive chats if the room no longer active.',
        );
      }

      let newMembers = existsRoom.members.filter(
        (member) => member.user.id != userId,
      );

      existsRoom.members = newMembers;

      const updatedRoom = await this.meetingServices.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async removeParticipant(
    code: number,
    participantId: number,
  ): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);

      if (!existsRoom) throw new NotFoundException('Room Not Found');

      let indexOfParticipant = existsRoom.participants.findIndex(
        (participant) => participant.id == participantId,
      );

      if (indexOfParticipant == -1)
        throw new NotFoundException('Participant Not Found');

      existsRoom.participants[indexOfParticipant].status = Status.Inactive;

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
