import {
  Controller,
  Body,
  Post,
  Get,
  HttpStatus,
  UseGuards,
  HttpCode,
  Request,
  SerializeOptions,
  Delete,
} from '@nestjs/common';
import { LoginSocialDto } from 'src/core/dtos/auth';
import { UserFactoryService } from '../user/user-factory.service';
import { AuthUseCases } from 'src/features/auth/auth.usecase';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { LoginResponseType } from 'src/features/auth/types/login-response.type';
import { AwsS3Service } from '../image/aws-s3/aws-s3.service';
import { ApiKeyGuard } from 'src/utils/strategies/api-key.strategy';

@ApiSecurity('api_key', ['api_key'])
@UseGuards(ApiKeyGuard)
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private userFactoryService: UserFactoryService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Post()
  loginWithSocial(@Body() loginWithSocial: LoginSocialDto) {
    const user = this.userFactoryService.createNewUser(loginWithSocial);

    return this.authUseCases.loginWithSocial(user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<Omit<LoginResponseType, 'user'>> {
    console.log(request);
    return this.authUseCases.refresh(request.user.sessionId);
  }

  @ApiBearerAuth()
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.authUseCases.logout(request.user.sessionId);
  }

  @ApiBearerAuth()
  @Post('presigned-url')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  public async createS3Presigned() {
    return this.awsS3Service.generatePresignedUrl('image/png');
  }
}
