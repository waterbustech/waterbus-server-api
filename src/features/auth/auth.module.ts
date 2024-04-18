import { Module } from '@nestjs/common';
import { AuthUseCases } from './auth.usecase';
import { UserModule } from '../user/user.module';
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
import { AwsS3Service } from '../image/aws-s3/aws-s3.service';
import { AuthGrpcController } from './auth.proto.controller';
import { EnvironmentConfigModule } from 'src/core/config/environment/environment.module';
import { ApiKeyGuard } from 'src/utils/strategies/api-key.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CCU } from 'src/core/entities/ccu.entity';
import { CCUService } from './ccu.service';
import { Participant } from 'src/core/entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CCU, Participant]),
    UserModule,
    JwtModule.register({}),
    SessionModule,
    PassportModule,
    EnvironmentConfigModule,
  ],
  providers: [
    AuthUseCases,
    AuthService,
    IsExist,
    IsNotExist,
    ApiKeyGuard,
    JwtStrategy,
    JwtRefreshStrategy,
    AnonymousStrategy,
    AwsS3Service,
    CCUService,
  ],
  exports: [AuthUseCases],
  controllers: [AuthController, AuthGrpcController],
})
export class AuthModule {}
