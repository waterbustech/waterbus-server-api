import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WhiteBoard } from 'src/core/entities/white-board.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { DeepPartial, RemoveOptions, Repository } from 'typeorm';

@Injectable()
export class WhiteBoardService {
  constructor(
    @InjectRepository(WhiteBoard)
    private whiteBoardRepository: Repository<WhiteBoard>,
  ) {}

  async create(whiteBoard: WhiteBoard): Promise<WhiteBoard> {
    try {
      const newWhiteBoard = await this.whiteBoardRepository.save(
        this.whiteBoardRepository.create(whiteBoard),
      );

      return newWhiteBoard;
    } catch (error) {
      throw error;
    }
  }

  findOne(
    fields: EntityCondition<WhiteBoard> | Array<EntityCondition<WhiteBoard>>,
  ): Promise<NullableType<WhiteBoard>> {
    return this.whiteBoardRepository.findOne({
      where: fields,
    });
  }

  update(
    id: WhiteBoard['id'],
    payload: DeepPartial<WhiteBoard>,
  ): Promise<WhiteBoard> {
    return this.whiteBoardRepository.save(
      this.whiteBoardRepository.create({
        id,
        ...Object.fromEntries(
          Object.entries(payload).filter(([_, v]) => v != null),
        ),
      }),
    );
  }

  async remove(
    entities: WhiteBoard[],
    options?: RemoveOptions,
  ): Promise<WhiteBoard[]> {
    return this.whiteBoardRepository.remove(entities);
  }
}
