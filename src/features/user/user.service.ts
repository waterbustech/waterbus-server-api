import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { NullableType } from '../../utils/types/nullable.type';
import { DeepPartial, Repository } from 'typeorm';
import { Client } from 'typesense';
import { TypesenseConfig } from 'src/core/config/typesense/typesense.config';
import { PaginationListQuery } from 'src/core/dtos';

@Injectable()
export class UserService {
  private typesenseClient: Client;
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly typesenseConfig: TypesenseConfig,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.typesenseClient = this.typesenseConfig.getClient();
    this.typesenseConfig.createSchema().then(() => {
      this.syncDataToTypesense();
    });
  }

  async create(user: User): Promise<User> {
    try {
      const existsUser = await this.findOne([
        { appleId: user.appleId },
        { googleId: user.googleId },
        { githubId: user.githubId },
      ]);

      if (existsUser) return existsUser;

      const newUser = await this.userRepository.save(
        this.userRepository.create(user),
      );

      this.updateUserInTypesense(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async findOne(
    fields: EntityCondition<User> | Array<EntityCondition<User>>,
  ): Promise<NullableType<User>> {
    return this.userRepository.findOne({
      where: fields,
    });
  }

  async update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.userRepository.save(
      this.userRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async syncDataToTypesense(): Promise<void> {
    try {
      const users = await this.userRepository.find();

      const documents = users.map((user) => ({
        id: user.id.toString(),
        userName: user.userName,
        fullName: user.fullName,
        avatar: user.avatar,
      }));

      await this.typesenseClient
        .collections('users')
        .documents()
        .import(documents, { action: 'create' });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async searchUsers(
    query: string,
    pagination: PaginationListQuery,
  ): Promise<any> {
    const searchParameters = {
      q: query,
      query_by: ['fullName', 'userName'],
      page: pagination.page,
      per_page: pagination.perPage,
    };

    return this.typesenseClient
      .collections('users')
      .documents()
      .search(searchParameters);
  }

  async updateUserInTypesense(user: User): Promise<void> {
    try {
      await this.typesenseClient.collections('users').documents().upsert({
        id: user.id.toString(),
        userName: user.userName,
        fullName: user.fullName,
        avatar: user.avatar,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
