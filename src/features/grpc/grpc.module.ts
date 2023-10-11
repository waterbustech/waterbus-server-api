import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth-grpc.controller';
import { JwtModule } from '@nestjs/jwt';
import { MeetingGrpcController } from './meeting-grpc.controller';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [JwtModule.register({}), MeetingsModule],
  controllers: [AuthGrpcController, MeetingGrpcController],
})
export class GrpcModule {}
