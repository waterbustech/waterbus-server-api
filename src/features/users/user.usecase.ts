import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities';
import { UsersService } from './users.service';

@Injectable()
export class UserUseCases {
  constructor(private userService: UsersService) {}

  async getUserById(userId: number): Promise<User> {
    try {
      const existsUser = await this.userService.findOne({
        id: userId,
      });

      return existsUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, user: User): Promise<User> {
    try {
      const updatedUser = await this.userService.update(userId, user);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
