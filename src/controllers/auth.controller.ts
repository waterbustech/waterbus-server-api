import { Controller, Body, Post } from '@nestjs/common';
import { LoginSocialDto } from 'src/core/dtos/auth';
import { UserFactoryService } from 'src/usecases/users/user-factory.service';
import { AuthUseCases } from 'src/usecases/auth/auth.usecase';

@Controller('api/author')
export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private userFactoryService: UserFactoryService,
  ) {}

  @Post()
  loginWithSocial(@Body() loginWithSocial: LoginSocialDto) {
    const user = this.userFactoryService.createNewUser(loginWithSocial);

    return this.authUseCases.loginWithSocial(user);
  }
}
