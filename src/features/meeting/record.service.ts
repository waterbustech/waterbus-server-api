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

  getRecordsByCreatedBy({
    userId,
    status,
    query,
  }: {
    userId: number;
    status: RecordStatus;
    query: PaginationListQuery;
  }): Promise<NullableType<Record[]>> {
    return this.recordRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.createdBy', 'createdBy')
      .where('createdBy.id = :userId', { userId })
      .andWhere('record.status =: status', { status })
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
      const newTracks = this.trackRepository.create(tracks);

      return await this.trackRepository.save(newTracks);
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
