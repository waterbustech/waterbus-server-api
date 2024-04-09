import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Message } from 'src/core/entities/message.entity';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from 'src/core/enums';
import { MeetingsUseCases } from '../meetings/meetings.usecase';
import { MemberStatus } from 'src/core/enums/member';
import { Meeting } from 'src/core/entities/meeting.entity';
import { PaginationListQuery } from 'src/core/dtos';

@Injectable()
export class ChatsUseCases {
  constructor(
    private chatService: ChatsService,
    private userService: UsersService,
    private meetingsUsecases: MeetingsUseCases,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getMessagesByMeeting({
    userId,
    meetingId,
    query,
  }: {
    userId: number;
    meetingId: number;
    query: PaginationListQuery;
  }): Promise<Message[]> {
    try {
      const meeting = await this.meetingsUsecases.getRoomById(meetingId);

      const indexOfUser = meeting.members.findIndex(
        (member) =>
          member.user.id == userId && member.status != MemberStatus.Inviting,
      );

      if (indexOfUser == -1) {
        throw new ForbiddenException(
          'You not allowed get messages from room that you not stay in there',
        );
      }

      const deletedAt = meeting.members[indexOfUser].deletedAt
        ? meeting.members[indexOfUser].deletedAt
        : meeting.createdAt;

      const messages = await this.chatService.findAllMessagesByMeeting({
        meetingId,
        deletedAt,
        query,
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }

  async createMessage({
    userId,
    meetingId,
    data,
  }: {
    userId: number;
    meetingId: number;
    data: string;
  }): Promise<Message> {
    try {
      const user = await this.userService.findOne({ id: userId });

      if (!user) throw new NotFoundException('User not found');

      const meeting = await this.meetingsUsecases.getRoomById(meetingId);

      const message = new Message();
      message.data = data;
      message.updatedAt = new Date();
      message.createdBy = user;
      message.meeting = meeting;

      const createdMessage = await this.messageRepository.save(
        this.messageRepository.create(message),
      );

      await this.meetingsUsecases.updateLatestMessage(createdMessage);

      return createdMessage;
    } catch (error) {
      throw error;
    }
  }

  async updateMessage({
    userId,
    messageId,
    data,
  }: {
    userId: number;
    messageId: number;
    data: string;
  }): Promise<Message> {
    try {
      const existsMessage = await this.chatService.findOne({ id: messageId });

      if (!existsMessage) throw new NotFoundException('Message not found');

      if (existsMessage.status == Status.Inactive) {
        throw new BadRequestException('Message has been deleted');
      }

      if (existsMessage.createdBy.id != userId) {
        throw new ForbiddenException(
          'You not allowed modify message of other users',
        );
      }

      existsMessage.data = data;
      existsMessage.updatedAt = new Date();

      const updatedMessage = await this.chatService.update(
        existsMessage.id,
        existsMessage,
      );

      return updatedMessage;
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage({
    userId,
    messageId,
  }: {
    userId: number;
    messageId: number;
  }) {
    try {
      const existsMessage = await this.chatService.findOne({ id: messageId });

      if (!existsMessage) throw new NotFoundException('Message not found');

      if (existsMessage.status == Status.Inactive) {
        throw new BadRequestException('Message has been deleted');
      }

      if (existsMessage.createdBy.id != userId) {
        throw new ForbiddenException(
          'You not allowed delete message of other users',
        );
      }

      existsMessage.status = Status.Inactive;

      const updatedMessage = await this.chatService.update(
        existsMessage.id,
        existsMessage,
      );

      return updatedMessage;
    } catch (error) {
      throw error;
    }
  }

  async deleteConversation({
    userId,
    meetingId,
  }: {
    userId: number;
    meetingId: number;
  }): Promise<Meeting> {
    return this.meetingsUsecases.updateDeletedAtForMember({
      userId,
      meetingId,
    });
  }
}
