import { Module } from '@nestjs/common';
import { AuthUseCases } from './auth.usecase';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/strategies/jwt-refresh.strategy';
import { AnonymousStrategy } from 'src/strategies/anonymous.strategy';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { JwtModule } from '@nestjs/jwt';
import { SessionModule } from '../session/session.module';
import { PassportModule } from '@nestjs/passport';

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
  ],
  exports: [AuthUseCases],
})
export class AuthUsecasesModule {}
