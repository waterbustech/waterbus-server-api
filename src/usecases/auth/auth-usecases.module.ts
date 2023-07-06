import { Module } from '@nestjs/common';
import { AuthUseCases } from './auth.usecase';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthUseCases],
  exports: [AuthUseCases],
})
export class AuthUsecasesModule {}
