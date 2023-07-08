import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { NullableType } from '../../utils/types/nullable.type';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    try {
      const existsUser = await this.findOne([
        { appleId: user.appleId },
        { googleId: user.googleId },
        { facebookId: user.facebookId },
      ]);

      if (existsUser) return existsUser;

      const newUser = await this.usersRepository.save(
        this.usersRepository.create(user),
      );

      return newUser;
    } catch (error) {
      console.log('CONCAC');
      throw error;
    }
  }

  findOne(
    fields: EntityCondition<User> | Array<EntityCondition<User>>,
  ): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }
}
