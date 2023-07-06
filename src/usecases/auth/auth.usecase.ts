import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthUseCases {
  constructor(private userService: UsersService) {}

  async loginWithSocial(user: User): Promise<User> {
    try {
      const createdUser = await this.userService.create(user);

      return createdUser;
    } catch (error) {
      throw error;
    }
  }
}
