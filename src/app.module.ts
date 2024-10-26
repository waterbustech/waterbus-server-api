import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './core/database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { MeetingModule } from './features/meeting/meeting.module';
import { ChatModule } from './features/chat/chat.module';
import { EnvironmentConfigModule } from './core/config/environment/environment.module';
import { HealthCheckController } from './app.controller';
import { NotFoundController } from './notfound.controller';
import { VideoProcessingModule } from './features/video-processing/video-processing.module';

@Module({
  imports: [
    EnvironmentConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    AuthModule,
    UserModule,
    MeetingModule,
    ChatModule,
    VideoProcessingModule,
  ],
  controllers: [HealthCheckController, NotFoundController],
})
export class AppModule {}
