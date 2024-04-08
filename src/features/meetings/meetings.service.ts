import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from '../../core/entities/meeting.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, Repository } from 'typeorm';
import { MemberStatus } from 'src/core/enums/member';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
  ) {}

  async create(meeting: Meeting): Promise<Meeting> {
    try {
      const newMeeting = await this.meetingsRepository.save(
        this.meetingsRepository.create(meeting),
      );

      return newMeeting;
    } catch (error) {
      throw error;
    }
  }

  findAll({
    userId,
    status,
  }: {
    userId: number;
    status: MemberStatus;
  }): Promise<NullableType<Meeting[]>> {
    return this.meetingsRepository
      .createQueryBuilder('meeting')
      .innerJoinAndSelect('meeting.members', 'member')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('meeting.latestMessage', 'latestMessage')
      .innerJoinAndSelect('member.user', 'memberUser')
      .leftJoinAndSelect('participants.user', 'user')
      .where('memberUser.id = :userId', { userId })
      .andWhere('member.status = :status', { status })
      .orderBy('latestMessage.createdAt', 'DESC')
      .getMany();
  }

  findOne(
    fields: EntityCondition<Meeting> | Array<EntityCondition<Meeting>>,
  ): Promise<NullableType<Meeting>> {
    return this.meetingsRepository.findOne({
      where: fields,
    });
  }

  update(id: Meeting['id'], payload: DeepPartial<Meeting>): Promise<Meeting> {
    return this.meetingsRepository.save(
      this.meetingsRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }
}
