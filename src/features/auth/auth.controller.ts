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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LoginResponseType } from 'src/features/auth/types/login-response.type';
import { AwsS3Service } from '../image/aws-s3/aws-s3.service';
import { ApiKeyGuard } from 'src/utils/strategies/api-key.strategy';

@ApiTags('auth')
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

  @ApiOperation({ summary: 'Login', description: 'Login with Social Media' })
  @Post()
  loginWithSocial(@Body() loginWithSocial: LoginSocialDto) {
    const user = this.userFactoryService.createNewUser(loginWithSocial);

    return this.authUseCases.loginWithSocial(user);
  }

  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Refresh token when access token expired',
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<Omit<LoginResponseType, 'user'>> {
    return this.authUseCases.refresh(request.user.sessionId);
  }

  @ApiOperation({ summary: 'Logout', description: 'Terminate your session' })
  @ApiBearerAuth()
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.authUseCases.logout(request.user.sessionId);
  }

  @ApiOperation({
    summary: 'Get AWS-S3 presigned url',
    description: 'Presigned url to upload avatar',
  })
  @ApiBearerAuth()
  @Post('presigned-url')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  public async createS3Presigned() {
    return this.awsS3Service.generatePresignedUrl('image/png');
  }
}
