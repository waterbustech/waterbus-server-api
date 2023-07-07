import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities';
import { LoginSocialDto, UpdateUserInfoDto } from '../../core/dtos';

@Injectable()
export class UserFactoryService {
  createNewUser(user: LoginSocialDto): User {
    const newUser = new User();
    newUser.fullName = user.fullName;
    newUser.userName = '123'; // generate unique userName
    newUser.googleId = user.googleId;
    newUser.facebookId = user.facebookId;
    newUser.appleId = user.appleId;

    return newUser;
  }

  getUserFromUpdateDto(user: UpdateUserInfoDto): User {
    const newUser = new User();
    newUser.fullName = user.fullName;
    newUser.avatar = user.avatar;

    return newUser;
  }
}
