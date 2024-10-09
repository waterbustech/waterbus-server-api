import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationListQuery } from 'src/core/dtos';
import { RecordTrack } from 'src/core/entities/record-track.entity';
import { Record } from 'src/core/entities/record.entity';
import { RecordStatus } from 'src/core/enums';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, In, RemoveOptions, Repository } from 'typeorm';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(RecordTrack)
    private trackRepository: Repository<RecordTrack>,
  ) {}

  getRecordsByStatus({
    userId = null,
    status,
    query,
  }: {
    userId?: number;
    status: RecordStatus;
    query: PaginationListQuery;
  }): Promise<NullableType<Record[]>> {
    const qb = this.recordRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.createdBy', 'createdBy')
      .where('record.status = :status', { status });

    if (userId !== null) {
      qb.andWhere('createdBy.id = :userId', { userId });
    }

    return qb
      .orderBy('record.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit)
      .getMany();
  }

  async create(record: Record): Promise<Record> {
    try {
      const newRecord = await this.recordRepository.save(
        this.recordRepository.create(record),
      );

      return newRecord;
    } catch (error) {
      throw error;
    }
  }

  async createTrack(track: RecordTrack): Promise<RecordTrack> {
    try {
      const newTrack = await this.trackRepository.save(
        this.trackRepository.create(track),
      );

      return newTrack;
    } catch (error) {
      throw error;
    }
  }

  async saveTracks(tracks: RecordTrack[]): Promise<RecordTrack[]> {
    try {
      const newTracks = await this.trackRepository.save(
        this.trackRepository.create(tracks),
      );

      return newTracks;
    } catch (error) {
      throw error;
    }
  }

  findOne(
    fields: EntityCondition<Record> | Array<EntityCondition<Record>>,
  ): Promise<NullableType<Record>> {
    return this.recordRepository.findOne({
      where: fields,
    });
  }

  findAllRecordTracks(
    fields: EntityCondition<RecordTrack> | Array<EntityCondition<RecordTrack>>,
  ): Promise<NullableType<RecordTrack>[]> {
    return this.trackRepository.find({
      where: fields,
      relations: ['user'],
    });
  }

  update(id: Record['id'], payload: DeepPartial<Record>): Promise<Record> {
    return this.recordRepository.save(
      this.recordRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }

  async remove(entities: Record[], options?: RemoveOptions): Promise<Record[]> {
    return this.recordRepository.remove(entities);
  }
}
