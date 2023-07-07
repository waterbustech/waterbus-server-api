import {
  Controller,
  Body,
  Post,
  HttpStatus,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { LoginSocialDto } from 'src/core/dtos/auth';
import { UserFactoryService } from 'src/usecases/users/user-factory.service';
import { AuthUseCases } from 'src/usecases/auth/auth.usecase';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private userFactoryService: UserFactoryService,
  ) {}

  @Post('login')
  loginWithSocial(@Body() loginWithSocial: LoginSocialDto) {
    const user = this.userFactoryService.createNewUser(loginWithSocial);

    return this.authUseCases.loginWithSocial(user);
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.authUseCases.logout(request.user.sessionId);
  }
}
