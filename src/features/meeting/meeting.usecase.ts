import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { Meeting } from 'src/core/entities/meeting.entity';
import bcrypt from 'bcryptjs';
import { Participant } from '../../core/entities/participant.entity';
import { MemberRole, MemberStatus } from '../../core/enums/member';
import { Member } from '../../core/entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../core/entities/message.entity';
import { PaginationListQuery } from 'src/core/dtos';
import { UserUseCases } from '../user/user.usecase';
import { CCU } from 'src/core/entities/ccu.entity';
import { ParticipantService } from './participant.service';
import { MeetingStatus } from 'src/core/enums/meeting';
import { ChatGrpcClientService } from 'src/services/chat.proto.service';

@Injectable()
export class MeetingUseCases {
  constructor(
    private meetingService: MeetingService,
    private userUseCases: UserUseCases,
    private participantService: ParticipantService,
    private readonly chatGrpcClientService: ChatGrpcClientService,
    @InjectRepository(CCU)
    private ccuRepository: Repository<CCU>,
  ) {}

  async getRoomsByUserId({
    userId,
    memberStatus,
    meetingStatus = MeetingStatus.Active,
    query,
  }: {
    userId: number;
    memberStatus: MemberStatus;
    meetingStatus?: MeetingStatus;
    query: PaginationListQuery;
  }): Promise<Meeting[]> {
    try {
      const rooms = await this.meetingService.findAll({
        userId,
        memberStatus,
        meetingStatus,
        query,
      });

      return rooms;
    } catch (error) {
      throw error;
    }
  }

  // MARK: CRUD

  async getRoomById(meetingId: number): Promise<Meeting> {
    try {
      const roomInfo = await this.meetingService.findOne({
        id: meetingId,
      });

      if (!roomInfo) throw new NotFoundException('Room Not Found');

      return roomInfo;
    } catch (error) {
      throw error;
    }
  }

  async getRoomByCode(roomCode: number): Promise<Meeting> {
    try {
      const roomInfo = await this.meetingService.findOne({
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
      const createdRoom = await this.meetingService.create(meeting);

      return createdRoom;
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(userId: number, meeting: Meeting): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException('Not found room');

      const indexHost = existsRoom.members.findIndex(
        (member) => member.user.id == userId && member.role == MemberRole.Host,
      );

      if (indexHost < 0)
        throw new ForbiddenException('User not allowed to update rooom');

      existsRoom.title ??= meeting.title;
      existsRoom.password ??= meeting.password;
      existsRoom.avatar ??= meeting.avatar;

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  // MARK: join for members and guest user

  async joinRoomWithPassword(
    meeting: Meeting,
    participant: Participant,
  ): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(meeting.code);

      if (!existsRoom) throw new NotFoundException('Room Not Found');

      const isMatchPassword = await bcrypt.compare(
        meeting.password,
        existsRoom.password,
      );

      if (!isMatchPassword) throw new BadRequestException('Wrong password!');

      // Just update if participant already exists in room
      const indexOfParticipant = existsRoom.participants.findIndex(
        (mParticipant) => mParticipant.id == participant.id,
      );

      if (indexOfParticipant != -1) {
        existsRoom.participants[indexOfParticipant] = participant;
      } else {
        existsRoom.participants.push(participant);
      }

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      updatedRoom.participants = updatedRoom.participants.filter(
        (mParticipant) =>
          mParticipant.ccu != null || mParticipant.id == participant.id,
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

      if (!existsRoom) throw new NotFoundException('Room Not Found');

      const indexOfMember = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1)
        throw new ForbiddenException('User not allow to join directly');

      // Just update if participant already exists in room
      const indexOfParticipant = existsRoom.participants.findIndex(
        (mParticipant) => mParticipant.id == participant.id,
      );

      if (indexOfParticipant != -1) {
        existsRoom.participants[indexOfParticipant] = participant;
      } else {
        existsRoom.participants.push(participant);
      }

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      updatedRoom.participants = updatedRoom.participants.filter(
        (mParticipant) =>
          mParticipant.ccu != null || mParticipant.id == participant.id,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async getParticipantById(participantId: number, socketId: string) {
    const participant = await this.participantService.findOne({
      id: participantId,
    });

    if (!participant) throw new NotFoundException('Not exists participant');

    if (!participant.ccu && socketId != 'WSid') {
      const ccu = await this.ccuRepository.findOne({
        where: {
          socketId: socketId,
        },
      });

      if (!ccu) throw new NotFoundException('Not exists CCU');

      participant.ccu = ccu;

      const participantUpdated = await this.participantService.update(
        participant.id,
        participant,
      );

      return participantUpdated;
    }

    return participant;
  }

  // MARK: related to members managerment

  async addRoomMember({
    code,
    hostId,
    userId,
  }: {
    code: number;
    hostId: number;
    userId: number;
  }) {
    try {
      const existsRoom = await this.getRoomByCode(code);

      const indexOfUser = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfUser != -1)
        throw new BadRequestException('User already in room');

      const indexOfHost = existsRoom.members.findIndex(
        (member) => member.user.id == hostId,
      );

      if (indexOfHost == -1) throw new NotFoundException('Host not found');

      const host = existsRoom.members[indexOfHost];

      if (host.role != MemberRole.Host)
        throw new ForbiddenException('You not allow to add user');

      const user = await this.userUseCases.getUserById(userId);

      if (!user) throw new NotFoundException('User not found');

      const member = new Member();
      member.user = user;

      existsRoom.members.push(member);

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      const memberIndex = updatedRoom.members.findIndex(
        (member) => member.user.id == user.id,
      );

      this.chatGrpcClientService.newInvitation({
        meeting: updatedRoom,
        member: updatedRoom.members[memberIndex],
      });

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async removeRoomMember({
    code,
    hostId,
    userId,
  }: {
    code: number;
    hostId: number;
    userId: number;
  }) {
    try {
      const existsRoom = await this.getRoomByCode(code);

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

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async acceptRoomInvitation({
    code,
    userId,
  }: {
    code: number;
    userId: number;
  }) {
    try {
      const existsRoom = await this.getRoomByCode(code);

      const indexOfUser = existsRoom.members.findIndex(
        (member) =>
          member.user.id == userId && member.status == MemberStatus.Inviting,
      );

      if (indexOfUser == -1) throw new NotFoundException('User not found');

      existsRoom.members[indexOfUser].status = MemberStatus.Joined;

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      this.chatGrpcClientService.newMemberJoined({
        meeting: existsRoom,
        member: existsRoom.members[indexOfUser],
      });

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  // MARK: related to message
  async updateLatestMessage(message: Message) {
    try {
      const meeting = await this.getRoomById(message.meeting.id);

      meeting.latestMessage = message;
      meeting.latestMessageCreatedAt = message.createdAt;

      for (const member of meeting.members) {
        if (member.status == MemberStatus.Invisible) {
          member.status = MemberStatus.Joined;
        }
      }

      const updatedMeeting = await this.meetingService.update(
        meeting.id,
        meeting,
      );

      return updatedMeeting;
    } catch (error) {
      throw error;
    }
  }

  async updateDeletedAtForMember({
    userId,
    meetingId,
  }: {
    userId: number;
    meetingId: number;
  }) {
    try {
      const meeting = await this.getRoomById(meetingId);

      const indexOfMember = meeting.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1) {
        throw new NotFoundException('User not joined meeting');
      }

      meeting.members[indexOfMember].softDeletedAt = new Date();
      meeting.members[indexOfMember].status = MemberStatus.Invisible;

      const updatedMeeting = await this.meetingService.update(
        meeting.id,
        meeting,
      );

      return updatedMeeting;
    } catch (error) {
      throw error;
    }
  }

  // MARK: related to remove

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

      const indexOfMember = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1) throw new NotFoundException('Member Not Found');

      if (existsRoom.members[indexOfMember].role == MemberRole.Host) {
        throw new ForbiddenException(
          'Host not allowed to leave the room. You can archive chats if the room no longer active.',
        );
      }

      existsRoom.members.splice(indexOfMember, 1);

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  async archivedRoom({
    code,
    userId,
  }: {
    code: number;
    userId: number;
  }): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);

      if (!existsRoom) throw new NotFoundException('Room Not Found');

      const indexOfMember = existsRoom.members.findIndex(
        (member) => member.user.id == userId,
      );

      if (indexOfMember == -1) throw new NotFoundException('Member Not Found');

      if (existsRoom.members[indexOfMember].role != MemberRole.Host) {
        throw new ForbiddenException(
          'Only Host permited to archived the room.',
        );
      }

      existsRoom.status = MeetingStatus.Archived;

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

  // Use for GRPC leave room or websocket disconnected
  async removeParticipant(
    code: number,
    participantId: number,
  ): Promise<Meeting> {
    try {
      const existsRoom = await this.getRoomByCode(code);
      if (!existsRoom) throw new NotFoundException('Room Not Found');

      const indexOfParticipant = existsRoom.participants.findIndex(
        (participant) => participant.id == participantId,
      );

      if (indexOfParticipant == -1) {
        throw new NotFoundException('Participant Not Found');
      }

      await this.participantService.remove([
        existsRoom.participants[indexOfParticipant],
      ]);

      existsRoom.participants.splice(indexOfParticipant, 1);

      const updatedRoom = await this.meetingService.update(
        existsRoom.id,
        existsRoom,
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }
}
