import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from '../../core/entities/meeting.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, Repository } from 'typeorm';
import { MemberStatus } from 'src/core/enums/member';
import { PaginationListQuery } from 'src/core/dtos';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
  ) {}

  async create(meeting: Meeting): Promise<Meeting> {
    try {
      const newMeeting = await this.meetingRepository.save(
        this.meetingRepository.create(meeting),
      );

      return newMeeting;
    } catch (error) {
      throw error;
    }
  }

  findAll({
    userId,
    status,
    query,
  }: {
    userId: number;
    status: MemberStatus;
    query: PaginationListQuery;
  }): Promise<NullableType<Meeting[]>> {
    const subQuery = this.meetingRepository
      .createQueryBuilder('subquery')
      .leftJoin('subquery.members', 'subMember')
      .leftJoin('subMember.user', 'subUser')
      .where('subMember.status = :status', { status })
      .andWhere('subUser.id = :userId', { userId })
      .select('subquery.id');

    return this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.members', 'member')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('meeting.latestMessage', 'latestMessage')
      .leftJoinAndSelect('member.user', 'user')
      .addSelect(
        'COALESCE(latestMessage.createdAt, meeting.createdAt)',
        'latest',
      )
      .andWhere(`meeting.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .orderBy('latest', 'DESC')
      .skip(query.skip)
      .take(query.limit)
      .getMany();
  }

  findOne(
    fields: EntityCondition<Meeting> | Array<EntityCondition<Meeting>>,
  ): Promise<NullableType<Meeting>> {
    return this.meetingRepository.findOne({
      where: fields,
    });
  }

  update(id: Meeting['id'], payload: DeepPartial<Meeting>): Promise<Meeting> {
    return this.meetingRepository.save(
      this.meetingRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }
}
