import { Module } from '@nestjs/common';
import { GrpcController } from './grpc.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [GrpcController],
})
export class GrpcModule {}
