import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../core/entities';
import { UserService } from './user.service';
import { PaginationListQuery } from 'src/core/dtos';

@Injectable()
export class UserUseCases {
  constructor(private userService: UserService) {}

  async searchUsers(q: string, pagination: PaginationListQuery): Promise<any> {
    return await this.userService.searchUsers(q, pagination);
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const existsUser = await this.userService.findOne({
        id: userId,
      });

      return existsUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUserName(userName: string): Promise<User | null> {
    try {
      const existsUser = await this.userService.findOne({
        userName: userName,
      });

      return existsUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUserName({
    userId,
    userName,
  }: {
    userId: number;
    userName: string;
  }): Promise<User | null> {
    try {
      const existsUser = await this.userService.findOne({
        id: userId,
      });

      if (!existsUser) {
        throw new NotFoundException('User not found');
      }

      existsUser.userName = userName;

      const updatedUser = await this.userService.update(
        existsUser.id,
        existsUser,
      );

      this.userService.updateUserInTypesense(updatedUser);

      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Username is already used');
    }
  }

  async updateUser(userId: number, user: User): Promise<User> {
    try {
      const updatedUser = await this.userService.update(userId, user);

      this.userService.updateUserInTypesense(updatedUser);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
