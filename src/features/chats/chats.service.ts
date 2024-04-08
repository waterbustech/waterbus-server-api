import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/core/entities/message.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Message)
    private chatsRepository: Repository<Message>,
  ) {}

  async create(message: Message): Promise<Message> {
    try {
      const messageCreated = await this.chatsRepository.save(
        this.chatsRepository.create(message),
      );

      return messageCreated;
    } catch (error) {
      throw error;
    }
  }

  findAllMessagesByMeeting({
    meetingId,
    deletedAt,
  }: {
    meetingId: number;
    deletedAt: Date;
  }): Promise<NullableType<Message[]>> {
    return this.chatsRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.meeting', 'meeting')
      .innerJoinAndSelect('message.createdBy', 'createdBy')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('message.createdAt > :deletedAt', { deletedAt })
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  findOne(
    fields: EntityCondition<Message> | Array<EntityCondition<Message>>,
  ): Promise<NullableType<Message>> {
    return this.chatsRepository.findOne({
      where: fields,
    });
  }

  update(id: Message['id'], payload: DeepPartial<Message>): Promise<Message> {
    return this.chatsRepository.save(
      this.chatsRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }
}
