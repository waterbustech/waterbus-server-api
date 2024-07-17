import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CCU } from 'src/core/entities/ccu.entity';
import { Participant } from 'src/core/entities/participant.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, In, Repository } from 'typeorm';

@Injectable()
export class CCUService {
  constructor(
    @InjectRepository(CCU)
    private ccuRepository: Repository<CCU>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async create(ccu: CCU): Promise<CCU> {
    try {
      const ccuCreated = await this.ccuRepository.save(
        this.ccuRepository.create(ccu),
      );

      return ccuCreated;
    } catch (error) {
      throw error;
    }
  }

  async findByUserIds({ userIds }: { userIds: Array<number> }): Promise<CCU[]> {
    return this.ccuRepository.find({
      where: {
        user: {
          id: In(userIds),
        },
      },
    });
  }

  findOne(
    fields: EntityCondition<CCU> | Array<EntityCondition<CCU>>,
  ): Promise<NullableType<CCU>> {
    return this.ccuRepository.findOne({
      where: fields,
    });
  }

  remove(ccu: CCU): Promise<CCU> {
    return this.ccuRepository.remove(ccu);
  }

  update(id: CCU['id'], payload: DeepPartial<CCU>): Promise<CCU> {
    return this.ccuRepository.save(
      this.ccuRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }

  async removeCCU(socketId: string) {
    const participantsToDelete = await this.participantRepository.find({
      where: { ccu: { socketId: socketId } },
    });

    if (participantsToDelete) {
      await this.participantRepository.remove(participantsToDelete);
    }

    const ccusToDelete = await this.ccuRepository.find({ where: { socketId } });

    if (ccusToDelete) {
      await this.ccuRepository.remove(ccusToDelete);
    }
  }

  async destroyByPodName(podName: string) {
    const participantsToDelete = await this.participantRepository.find({
      where: { ccu: { podName } },
    });

    if (participantsToDelete) {
      await this.participantRepository.remove(participantsToDelete);
    }

    const ccusToDelete = await this.ccuRepository.find({ where: { podName } });

    if (ccusToDelete) {
      await this.ccuRepository.remove(ccusToDelete);
    }
  }
}
