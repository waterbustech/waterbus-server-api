import { Injectable } from '@nestjs/common';
import { User } from '../../core/entities';
import { AuthService } from './auth.service';
import { LoginResponseType } from './types/login-response.type';

@Injectable()
export class AuthUseCases {
  constructor(private authService: AuthService) {}

  async loginWithSocial(user: User): Promise<LoginResponseType> {
    return this.authService.loginWithSocial(user);
  }

  async refresh(sessionId: number) {
    return await this.authService.refreshToken({ sessionId });
  }

  async logout(sessionId: number) {
    await this.authService.logout({ sessionId });
  }
}
