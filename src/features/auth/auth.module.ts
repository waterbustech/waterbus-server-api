import { Module } from '@nestjs/common';
import { AuthUseCases } from './auth.usecase';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/utils/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/utils/strategies/jwt-refresh.strategy';
import { AnonymousStrategy } from 'src/utils/strategies/anonymous.strategy';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { JwtModule } from '@nestjs/jwt';
import { SessionModule } from '../session/session.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AwsS3Service } from '../images/aws-s3/aws-s3.service';
import { AuthGrpcController } from './auth.proto.controller';

@Module({
  imports: [UsersModule, JwtModule.register({}), SessionModule, PassportModule],
  providers: [
    AuthUseCases,
    AuthService,
    IsExist,
    IsNotExist,
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    AnonymousStrategy,
    AwsS3Service,
  ],
  exports: [AuthUseCases],
  controllers: [AuthController, AuthGrpcController],
})
export class AuthModule {}
