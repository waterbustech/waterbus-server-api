import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, In, RemoveOptions, Repository } from 'typeorm';
import { Participant } from 'src/core/entities/participant.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async findByIds(ids: Participant['id'][]): Promise<Participant[]> {
    try {
      const participants = await this.participantRepository.findBy({
        id: In(ids),
      });

      return participants;
    } catch (error) {
      throw error;
    }
  }

  async create(participant: Participant): Promise<Participant> {
    try {
      const newParticipant = await this.participantRepository.save(
        this.participantRepository.create(participant),
      );

      return newParticipant;
    } catch (error) {
      throw error;
    }
  }

  findOne(
    fields: EntityCondition<Participant> | Array<EntityCondition<Participant>>,
  ): Promise<NullableType<Participant>> {
    return this.participantRepository.findOne({
      where: fields,
    });
  }

  update(
    id: Participant['id'],
    payload: DeepPartial<Participant>,
  ): Promise<Participant> {
    return this.participantRepository.save(
      this.participantRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }

  async remove(
    entities: Participant[],
    options?: RemoveOptions,
  ): Promise<Participant[]> {
    return this.participantRepository.remove(entities);
  }
}
